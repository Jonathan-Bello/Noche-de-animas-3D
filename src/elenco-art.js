// Elenco aprobado por el usuario; Sensitivo catrin rojo corregido a peticion.
// Las funciones originales del rig permanecen en chars3d.js como makeBaseCharacter/animateBaseCharacter.
const NDAElencoArt = (() => {
const makeCharacter=makeBaseCharacter,originalAnimate=animateBaseCharacter;
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

const material=createVectorSculptureMaterial;
// Project color onto existing planar facets: paint rather than a separate mask.
function frontSurfaceOf(mesh){
 const p=mesh.geometry.attributes.position,ix=mesh.geometry.index;
 return(x,y)=>{let best=-Infinity;const count=ix?ix.count:p.count;
  for(let i=0;i<count;i+=3){const ids=[0,1,2].map(j=>ix?ix.getX(i+j):i+j),[A,B,C]=ids.map(j=>[p.getX(j),p.getY(j),p.getZ(j)]);
   const d=(B[1]-C[1])*(A[0]-C[0])+(C[0]-B[0])*(A[1]-C[1]);if(Math.abs(d)<1e-10)continue;
   const u=((B[1]-C[1])*(x-C[0])+(C[0]-B[0])*(y-C[1]))/d,v=((C[1]-A[1])*(x-C[0])+(A[0]-C[0])*(y-C[1]))/d,w=1-u-v;
   if(u>=-1e-5&&v>=-1e-5&&w>=-1e-5)best=Math.max(best,u*A[2]+v*B[2]+w*C[2]);
  }return Number.isFinite(best)?best+.0018:.10;
 };
}
function makeAlexStudy({original=false}={}){
 const r=makeCharacter('curandero');if(original)return r;
 r.id='sensitivo';r.g.name='Alex_Sensitivo_Catrin_Rojo';
 const remove=[];r.acc.traverse(o=>{if(['chaleco_abierto_ajustado_a_camisa','rebozo_pieza_continua'].includes(o.name))remove.push(o);});for(const o of remove)o.parent.remove(o);
 const glasses=r.head.getObjectByName('alex_lentes_redondos');if(glasses)glasses.parent.remove(glasses);
 const mat=(hex,name)=>{const m=createVectorSculptureMaterial(hex);m.name=name;m.userData={c:m.color.getHex(),e:0};return m;};
 const ivory=mat('#F0E0CA','maquillaje_catrin_marfil'),red=mat('#B5263C','maquillaje_rojo_carmesi'),wine=mat('#591221','maquillaje_vino_oscuro');
 const shirt=mat('#AD2237','camisa_elegante_roja'),embroidery=mat('#651729','adornos_rojo_oscuro'),pants=mat('#3A1418','pantalon_vino'),boots=mat('#2A1410','calzado_vino');
 // Exact approved body, hair, neck and limb geometry; only materials and paint/embroidery change.
 r.g.traverse(o=>{if(!o.isMesh||Array.isArray(o.material))return;const c=o.material?.color?.getHex();if(c===0x7a1f2e)o.material=shirt;else if(c===0xd8a03a)o.material=embroidery;else if(c===0x5a3a26)o.material=pants;else if(c===0x3a2214)o.material=boots;});
 const skull=r.head.children.find(o=>o.isMesh&&o.position.lengthSq()===0);skull.material=ivory;skull.name='rostro_vivo_pintado_catrin';
 const surface=frontSurfaceOf(skull),paint=new THREE.Group();paint.name='maquillaje_catrin_rojo';r.head.add(paint);
 const draw=(name,points,m)=>polygon(paint,name,points,.0012,m,0,[],surface);
 for(const side of[-1,1]){
  const x=side*.043,y=.162;
  draw('roseton_rojo_catrin',Array.from({length:16},(_,j)=>{const a=j*Math.PI/8,k=j%2?.85:1;return[x+Math.cos(a)*.036*k,y+Math.sin(a)*.033*k];}),red);
  draw('cuenca_pintada_vino',Array.from({length:8},(_,j)=>{const a=j*Math.PI/4;return[x+Math.cos(a)*.023,y+Math.sin(a)*.020];}),wine);
  draw('arabesco_mejilla',[[side*.027,.119],[side*.047,.123],[side*.066,.112],[side*.06,.105],[side*.045,.114],[side*.032,.111]],red);
 }
 const nose=r.head.children.find(o=>o.isMesh&&Math.abs(o.position.y-.125)<1e-6&&Math.abs(o.position.z-.104)<1e-6);if(nose)nose.material=wine;
 draw('nariz_pintada',[[-.008,.128],[.008,.128],[0,.143]],wine);
 draw('sonrisa_catrin_pintada',[[-.066,.100],[-.044,.091],[0,.085],[.044,.091],[.066,.100],[.061,.094],[.043,.086],[0,.080],[-.043,.086],[-.061,.094]],red);
 for(let j=-3;j<=3;j++){const x=j*.012,y=.084+Math.abs(j)*.002;draw('raya_maquillaje_dientes',[[x-.0013,y-.006],[x+.0013,y-.006],[x+.0013,y+.006],[x-.0013,y+.006]],wine);}
 draw('cruz_frontal_roja',[[-.003,.203],[.003,.203],[.003,.212],[.010,.212],[.010,.217],[.003,.217],[.003,.228],[-.003,.228],[-.003,.217],[-.010,.217],[-.010,.212],[-.003,.212]],red);
 draw('diamante_menton',[[0,.048],[.009,.058],[0,.069],[-.009,.058]],red);
 const shirtMesh=r.acc.getObjectByName('camisa_ahusada_con_espesor'),shirtSurface=frontSurfaceOf(shirtMesh),ornament=new THREE.Group();ornament.name='camisa_roja_bordado_oscuro';r.acc.add(ornament);
 for(const side of[-1,1]){
  for(const y of[.12,.24,.35]){const x=side*.075;polygon(ornament,'flor_bordada_rojo_oscuro',Array.from({length:12},(_,j)=>{const a=j*Math.PI/6,rad=j%2?.010:.026;return[x+Math.cos(a)*rad,y+Math.sin(a)*rad];}),.0015,embroidery,0,[],shirtSurface);}
  polygon(ornament,'tallo_bordado',[[side*.073,.08],[side*.078,.08],[side*.078,.39],[side*.073,.39]],.0015,embroidery,0,[],shirtSurface);
 }
 r.acc.traverse(o=>{if(o.name==='bordado_collar')o.material=embroidery;});
 const mats=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial)mats.add(m);});r.mats=[...mats];
 r.g.userData={...r.g.userData,artStudy:'sensitivo_catrin_rojo_v08',approval:'user_requested_2026_11_19',identity:'Alex vivo maquillado de catrin, mismo cuerpo y cabello',face:'maquillaje rojo y vino sobre marfil; sin globos oculares ni pupilas'};
 return r;
}

const IDS=Object.keys(CHARS);
const DESIGN={
 ines:{title:'Inés',silhouette:'Falda campana en tres niveles; cintura marcada y rebozo magenta bajo los hombros.',hair:'Trenza gruesa continua hasta media espalda, raya diagonal y flor naranja.',key:'Blusa marfil, bordado guinda, falda ciruela y aros.'},
 rafael:{title:'Rafael',silhouette:'Pecho amplio, chaleco verde de trabajo con cuatro bolsillos; mangas remangadas.',hair:'Onda oscura barrida hacia atrás y nuca corta; barba compacta facetada.',key:'Pañuelo rojo, camisa beige y equipo de campo.'},
 mateo:{title:'Padre Mateo',silhouette:'Saco vino entallado, faldones cortos, solapas largas y chaleco guinda.',hair:'Raya lateral baja, poco volumen y canas discretas en las sienes.',key:'Sin barba ni bigote; camisa marfil y rosario ámbar.'},
 tomas:{title:'Tomás',silhouette:'Poncho largo asimétrico sobre un cuerpo estrecho; sombrero de ala amplia.',hair:'Pelo corto bajo sombrero; bigote geométrico, sin barba.',key:'Petróleo y crema, grecas escalonadas y morral de cuero.'},
 amalia:{title:'Amalia',silhouette:'Falda verde en A más estrecha; rebozo marfil triangular con punta larga.',hair:'Trenza más estrecha y larga, con canas integradas en la masa.',key:'Bordado guinda, aros y silueta de manta protectora.'},
 vigia:{title:'Jhonnatan · Vigía',silhouette:'Torso alargado, chaleco guinda ajustado, pañuelo verde y morral cruzado.',hair:'Raya central con alas laterales y nuca media, sin mechas rojas.',key:'Camisa azul y bordado ocre; sin lentes ni barba.'},
 improvisador:{title:'Ángel · Improvisador',silhouette:'Chaqueta roja más estrecha, capucha recogida con volumen y dobladillo recto.',hair:'Flequillo angular irregular y volumen superior compacto, sin esferas.',key:'Lentes rectangulares negros gruesos, bordados y cordones crema.'},
 tecnico:{title:'Robert · Técnico',silhouette:'Hombros anchos, torso robusto, overol ocre y pantalón de trabajo amplio.',hair:'Base corta y un mechón elevado grande, barrido hacia un lado.',key:'Pañuelo MORADO solicitado, camisa marfil y herramientas en peto.'},
 detective:{title:'Fermín · Detective',silhouette:'Poncho más corto y simétrico que el de Tomás, sombrero más compacto.',hair:'Onda superior corta, laterales limpios; sin barba ni bigote.',key:'Petróleo, grecas crema, morral y hebilla ámbar.'},
 curandero:{title:'Alex · Curandero',silhouette:'Versión aprobada, sin cambio de proporciones ni cuello.',hair:'Tres masas aprobadas, raya central y mechas rojizas.',key:'Lentes redondos, camisa vino, chaleco petróleo y rebozo verde.'},
 sensitivo:{title:'Alex · Sensitivo',silhouette:'Mismo cuerpo, cabello y camisa del Curandero; sin chaleco ni rebozo.',hair:'Exactamente el cabello aprobado de Alex.',key:'Maquillaje de catrín rojo y vino; camisa roja elegante con adornos rojo oscuro; sin lentes.'},
 devota:{title:'Jenny · Devota',silhouette:'Falda vino con caída más recogida arriba y vuelo al bajo; rebozo petróleo diagonal.',hair:'Bob castaño rojizo hasta la nuca, ondas amplias y puntas angulares.',key:'Blusa marfil con bordado guinda, aros y rosario.'},
 guardaespaldas:{title:'Jorge · Guardaespaldas',silhouette:'Trapecio robusto con abrigo largo taupe, solapas grandes y abertura frontal.',hair:'Corte corto con flequillo sesgado y matices vino; sin barba.',key:'Lentes rectangulares finos, interior oscuro, cinturón posterior.'}
};
const B=0x201619,CREAM=0xeee0c8,GOLD=0xc08a2a;
function mat(c){const m=material(c);m.userData={c:new THREE.Color(c).getHex(),e:0};return m;}
function rows(list,b=1){return list.map(([y,w,d,z=0,x=0])=>({y,w:w*b,d:d*b,z,x}));}
function clearMeshes(g){for(const o of [...g.children])if(o.isMesh)g.remove(o);}
function panel(p,n,pts,c,z=.14,t=.007){return polygon(p,n,pts,t,c,z);}
function box(p,n,x,y,z,w,h,d,c){const m=mesh(p,n,new THREE.BoxGeometry(w,h,d),c);m.position.set(x,y,z);return m;}
function segment(p,n,a,b,r,c){const A=new THREE.Vector3(...a),Z=new THREE.Vector3(...b),v=Z.clone().sub(A);const m=mesh(p,n,new THREE.CylinderGeometry(r,r,v.length(),4),c);m.position.copy(A.add(Z).multiplyScalar(.5));m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m;}
function facetedMass(p,n,outline,c,depth=.045,surface=(x,y)=>.138-(y-.18)*.34){
 const N=outline.length,v=outline.map(([x,y])=>[x,y,surface(x,y)]),ix=[];
 v.push(...outline.map(([x,y])=>[x,y,surface(x,y)-depth]));
 const center=outline.reduce((a,[x,y])=>[a[0]+x/N,a[1]+y/N],[0,0]);v.push([center[0],center[1],surface(...center)+.018]);
 for(let j=0;j<N;j++){const k=(j+1)%N;ix.push(2*N,j,k,j,j+N,k,k,j+N,k+N);}
 for(let j=1;j<N-1;j++)ix.push(N,N+j+1,N+j);
 return mesh(p,n,geo(v,ix),c);
}
function ribbon(p,n,path,width,c,t=.008){
 const v=[],ix=[];for(const[x,y,z]of path)v.push([x-width/2,y,z],[x+width/2,y,z+.004]);
 const N=v.length;v.push(...v.map(([x,y,z])=>[x,y,z-t]));
 for(let i=0;i<path.length-1;i++){const a=i*2,b=a+1,d=a+2,e=a+3;ix.push(a,b,d,b,e,d,a+N,d+N,b+N,b+N,d+N,e+N,a,d,a+N,d,d+N,a+N,b,b+N,e,e,b+N,e+N);}
 for(const a of[0,N-2])ix.push(a,a+N,a+1,a+1,a+N,a+N+1);
 return mesh(p,n,geo(v,ix),c);
}
function fringe(p,name,x,y,z,width,c,count=9){for(let i=0;i<count;i++){const a=x-width/2+i*width/count;panel(p,name+i,[[a,y],[a+width/count*.5,y],[a+width/count*.45,y-.034],[a-.002,y-.030]],c,z,.006);}}
function collar(p,c,b=1){panel(p,'cuello_solapa_I',[[-.065,.522],[-.005,.486],[-.047,.442],[-.111,.484]],c,.083);panel(p,'cuello_solapa_D',[[.005,.486],[.065,.522],[.111,.484],[.047,.442]],c,.083);}
function buttons(p,c,z=.124){for(const y of[.11,.23,.35])panel(p,'boton',Array.from({length:6},(_,i)=>[Math.cos(i*Math.PI/3)*.005,y+Math.sin(i*Math.PI/3)*.005]),c,z);}
function embroidered(p,x,y,z,c,scale=1){flower(p,'bordado_flor',x,y,z,.018*scale,c);}
function glasses(r,thick=false){const g=group(r.head,'lentes_rectangulares'),c=mat(B),w=.064,h=.042,t=thick?.006:.003;
 for(const sd of[-1,1]){const x=sd*.042;panel(g,'aro_rectangular',[[x-w/2,.16-h/2],[x+w/2,.16-h/2],[x+w/2,.16+h/2],[x-w/2,.16+h/2]],c,.114,.006);const m=g.children.at(-1);g.remove(m);
 polygon(g,'montura_con_hueco',[[x-w/2,.16-h/2],[x+w/2,.16-h/2],[x+w/2,.16+h/2],[x-w/2,.16+h/2]],.006,c,.114,[[[x-w/2+t,.16-h/2+t],[x-w/2+t,.16+h/2-t],[x+w/2-t,.16+h/2-t],[x+w/2-t,.16-h/2+t]]]);
 segment(g,'patilla',[sd*.076,.17,.115],[sd*.103,.17,-.018],t/2,c);}
 segment(g,'puente',[-.012,.16,.117],[.012,.16,.117],thick?.003:.002,c);
}
function earrings(r){const c=mat(GOLD);for(const sd of[-1,1]){const pts=Array.from({length:8},(_,i)=>[sd*.106+Math.cos(i*Math.PI/4)*.016,.102+Math.sin(i*Math.PI/4)*.022]);const hole=Array.from({length:8},(_,i)=>[sd*.106+Math.cos(-i*Math.PI/4)*.011,.102+Math.sin(-i*Math.PI/4)*.016]);polygon(r.head,'aro_dorado',pts,.004,c,.009,[hole]);}}
function rosary(p,x=.1,y=.27,z=.17){const c=mat(GOLD);const pts=Array.from({length:11},(_,j)=>{const a=j*Math.PI*2/11;return[x+Math.cos(a)*.037,y+Math.sin(a)*.052,z];});
 for(let j=0;j<pts.length;j++){segment(p,'hilo_rosario',pts[j],pts[(j+1)%pts.length],.0015,c);const m=mesh(p,'cuenta_ambar',new THREE.OctahedronGeometry(.005),c);m.position.set(...pts[j]);}
 box(p,'cruz_vertical',x,y-.074,z,.007,.035,.006,c);box(p,'cruz_horizontal',x,y-.069,z,.022,.006,.006,c);
}
function scarf(p,c){ribbon(p,'panuelo_cuello',[[-.075,.48,.064],[0,.421,.145],[.075,.48,.064]],.052,c);panel(p,'nudo_panuelo',[[-.024,.438],[.019,.438],[.032,.410],[0,.390],[-.022,.414]],c,.155);panel(p,'colas_panuelo',[[-.012,.411],[.035,.404],[.060,.29],[.011,.32],[-.036,.27]],c,.15);}
function bag(p,b=1,pon=false){const leather=mat(0x87512c),dark=mat(0x62341f),gold=mat(GOLD);
 ribbon(p,'correa_morral',[[.17*b,.46,pon?.19:.104],[.08*b,.26,pon?.245:.167],[-.11*b,.04,pon?.24:.15],[-.18*b,-.10,pon?.23:.14]],.027,leather);
 const g=group(p,'morral_lateral',[pon?-.23*b:-.18*b,pon?-.22:-.075,pon?.185:.035]);solid(g,'cuerpo_morral',rows([[-.16,.075,.055],[0,.083,.06],[.035,.075,.052]]),leather,6);
 panel(g,'tapa_morral',[[-.08,.024],[.08,.024],[.074,-.04],[0,-.069],[-.073,-.04]],dark,.058);box(g,'hebilla',0,-.045,.07,.027,.023,.007,gold);
}
function vest(p,b,c,pockets=false){const g=group(p,'chaleco_con_sisas');shell(g,'cuerpo_chaleco',rows([[0,.17,.128],[.14,.159,.125],[.29,.2,.143],[.4,.213,.139],[.475,.137,.107]],b),c,8,.017,Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4),true);
 if(pockets)for(const sd of[-1,1])for(const y of[.13,.29]){const x=sd*.112*b;panel(g,'bolsillo_con_tapa',[[x-.034,y-.036],[x+.034,y-.036],[x+.034,y+.012],[x-.034,y+.012]],c,.146*b);box(g,'tapa',x,y+.013,.155*b,.07,.012,.008,c);}
 return g;
}
function coat(r,c,long=false){const b=CHARS[r.id].build||1,g=group(r.acc,'saco_con_sisas'),base=long?-.55:-.18;
 shell(g,'prenda_abierta_con_grosor',rows([[base,.225,.16],[.02,.184,.142],[.17,.17,.134],[.30,.205,.149],[.40,.226,.143],[.475,.142,.113]],b),c,8,.019,Array.from({length:8},(_,i)=>Math.PI/8+i*Math.PI/4),true);
 const lap=mat(long?0x796c51:0x632333);
 for(const sd of[-1,1])panel(g,'solapa_ancha',[[sd*.07,.49],[sd*.163,.41],[sd*.121,.35],[sd*.153,.32],[sd*.063,.12]],lap,.147*b);
 if(long){box(g,'cinturon_posterior',0,.09,-.164*b,.31*b,.026,.012,lap);for(const sd of[-1,1])box(g,'bolsillo_abrigo',sd*.16,-.1,.148*b,.068,.022,.012,lap);}
 return g;
}
function hair(r,S){r.hair.clear();const g=r.hair,c=mat(S.hair.c),shade=mat(new THREE.Color(S.hair.c).multiplyScalar(1.18)),id=r.id;
 const low=id==='devota'?.035:id==='vigia'?.075:.125,high=id==='tecnico'?.301:id==='improvisador'?.300:.283;
 const v=[],ix=[];for(let row=0;row<4;row++)for(let j=0;j<8;j++){const a=j*Math.PI/4,f=Math.max(0,Math.cos(a)),back=Math.max(0,-Math.cos(a));let y=[low+f*(.218-low)-back*.02,.222,high-.025,high][row];
  const radius=[.106,.115,.093,.037][row],zrad=[.104,.123,.105,.052][row];v.push([Math.sin(a)*radius,y,Math.cos(a)*zrad-.011]);}
 for(let row=0;row<3;row++)for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8);}for(let j=1;j<7;j++){ix.push(0,j+1,j,24,24+j,24+j+1);}mesh(g,'masa_nuca_sienes_cerrada',geo(v,ix),c);
 const waveLeft=[[-.109,.173],[-.128,.218],[-.106,.259],[-.045,.297],[.01,.282],[-.037,.250],[-.071,.225],[-.083,.182]];
 const waveRight=[[.002,.281],[.045,.291],[.093,.267],[.123,.221],[.105,.175],[.081,.212],[.053,.25]];
 if(id==='ines'||id==='amalia'){
  facetedMass(g,'raya_diagonal',[[-.109,.198],[-.104,.254],[-.05,.283],[.038,.276],[.082,.254],[-.027,.237],[-.077,.199]],c,.04);
  const len=id==='ines'?.41:.46,points=[];for(let j=0;j<9;j++)points.push([j%2?.012:-.012,.12-j*len/8,-.13-j*.009]);
  // One continuous braid, with alternating angular cross sections and a sealed tip.
  const vertices=[],indices=[];for(let j=0;j<points.length;j++){const[x,y,z]=points[j],w=.045-j*.0032;for(let k=0;k<6;k++){const a=k*Math.PI/3+(j%2?.35:-.35);vertices.push([x+Math.cos(a)*w,y,z+Math.sin(a)*w*.8]);}}
  for(let j=0;j<8;j++)for(let k=0;k<6;k++){const a=j*6+k,b=j*6+(k+1)%6;indices.push(a,b,a+6,b,b+6,a+6);}for(let k=1;k<5;k++)indices.push(48,48+k,48+k+1);const braid=mesh(g,'trenza_continua_sin_bolas',geo(vertices,indices),c);
  braid.userData.rearLengthMeters=len;
  if(id==='amalia'){ribbon(g,'mechon_cana',[[.04,.27,-.095],[.065,.21,-.115],[.023,.12,-.159],[-.01,-.12,-.20]],.013,mat(0xaaa39c));facetedMass(g,'cana_sien',[[-.08,.235],[-.095,.20],[-.092,.16],[-.08,.19],[-.063,.24]],mat(0xaaa39c),.005);}
  else flower(g,'flor_naranja',-.104,.164,.025,.035,mat(0xe0782a));
 }else if(id==='devota'){
  facetedMass(g,'bob_onda_izquierda',[[-.112,.045],[-.131,.083],[-.135,.154],[-.12,.234],[-.063,.286],[.004,.282],[-.028,.249],[-.078,.209],[-.075,.13],[-.091,.091],[-.075,.054]],shade,.065);
  facetedMass(g,'bob_onda_derecha',[[.005,.283],[.061,.286],[.117,.245],[.133,.17],[.125,.09],[.099,.046],[.083,.069],[.09,.116],[.078,.177],[.073,.232],[.029,.257]],c,.065);
 }else if(id==='vigia'){
  facetedMass(g,'onda_partida_I',waveLeft,c,.052);facetedMass(g,'onda_partida_D',waveRight,shade,.05);
 }else if(id==='tecnico'){
  facetedMass(g,'mechon_elevado',[[-.111,.211],[-.122,.263],[-.074,.308],[-.015,.330],[.043,.322],[.096,.281],[.08,.226],[.047,.209],[.054,.256],[.008,.273],[-.059,.244]],shade,.069);
 }else if(id==='improvisador'){
  facetedMass(g,'flequillo_irregular',[[-.112,.19],[-.124,.245],[-.098,.285],[-.04,.308],[.021,.292],[.089,.268],[.108,.216],[.076,.227],[.055,.193],[.03,.228],[-.005,.205],[-.03,.241],[-.064,.214],[-.082,.231]],shade,.055);
 }else if(id==='guardaespaldas'){
  facetedMass(g,'flequillo_corto_sesgado',[[-.109,.204],[-.109,.255],[-.044,.284],[.061,.27],[.109,.235],[.096,.198],[.074,.219],[.051,.197],[.027,.23],[-.003,.208],[-.017,.238],[-.064,.212]],shade,.038);
 }else if(id==='rafael'){
  facetedMass(g,'onda_retrocedida',[[-.113,.213],[-.119,.257],[-.078,.296],[-.021,.306],[.075,.274],[.101,.232],[.074,.244],[.019,.264],[-.041,.246],[-.085,.209]],shade,.055);
 }else{
  facetedMass(g,'raya_lateral_baja',[[-.108,.205],[-.108,.249],[-.067,.281],[.014,.29],[.081,.267],[.096,.233],[.055,.248],[-.015,.264],[-.055,.234],[-.086,.204]],shade,.036);
  if(id==='mateo')for(const sd of[-1,1])facetedMass(g,'cana_discreta',[[sd*.083,.17],[sd*.1,.19],[sd*.1,.223],[sd*.083,.213]],mat(0x8a8078),.005);
 }
 if(id==='rafael'){
  facetedMass(r.head,'barba_compacta',[[-.079,.116],[-.066,.079],[-.036,.037],[.028,.035],[.069,.078],[.079,.116],[.045,.087],[-.04,.087]],c,.025,(x,y)=>.10-Math.abs(x)*.16);
 }
 if(id==='rafael'||id==='tomas')for(const sd of[-1,1])facetedMass(r.head,'bigote_identitario',[[0,.107],[sd*.018,.118],[sd*.057,.101],[sd*.056,.09],[sd*.025,.097],[0,.099]],c,.007,()=>.11);
}
function hat(r,detective){const c=mat(detective?0x235a5a:0x23565c),cream=mat(CREAM),g=group(r.head,'sombrero_octagonal');
 solid(g,'ala_con_espesor',rows([[.262,detective?.166:.184,.15],[.275,detective?.168:.187,.153]]),c,8);
 solid(g,'copa',rows([[.275,.105,.10],[.365,.089,.085],[.381,.077,.074]]),c,8);
 shell(g,'cinta_sombrero',rows([[.29,.107,.102],[.308,.103,.098]]),cream,8,.004);
}
function poncho(r,c,detective){const b=CHARS[r.id].build||1,g=group(r.acc,'poncho_continuo'),low=detective?-.13:-.31;
 const angles=Array.from({length:8},(_,i)=>i*Math.PI/4),v=[],ix=[];
 const ring=[[.53,.073,.07],[.46,.245*b,.18],[.18,.32*b,.215],[low,.31*b,.225]];
 for(let k=0;k<ring.length;k++)for(const a of angles){const[y,w,d]=ring[k];let yy=y;if(k===3)yy+=Math.abs(Math.sin(a))*.18+(detective?0:Math.sin(a)*.085);v.push([Math.sin(a)*w,yy,Math.cos(a)*d]);}
 const N=v.length;v.push(...v.map(([x,y,z])=>[x*.975,y+.002,z*.965]));
 for(let row=0;row<3;row++)for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8,a+N,a+8+N,b+N,b+N,a+8+N,b+8+N);}
 for(const row of[0,3])for(let j=0;j<8;j++){const a=row*8+j,b=row*8+(j+1)%8;ix.push(a,a+N,b,b,a+N,b+N);}mesh(g,'manta_cerrada_espesor_sin_paneles_sueltos',geo(v,ix),c);
 const cream=mat(CREAM);
 // Embroidery is projected onto the actual front surface, avoiding floating strips.
 function front(x,y){let r=ring.length-2;for(let k=0;k<ring.length-1;k++)if(y<=ring[k][0]&&y>=ring[k+1][0]){r=k;break;}
  const a=ring[r],b=ring[r+1],t=THREE.MathUtils.clamp((y-a[0])/(b[0]-a[0]),0,1),w=THREE.MathUtils.lerp(a[1],b[1],t),d=THREE.MathUtils.lerp(a[2],b[2],t);
  return d*(1-(1-Math.SQRT1_2)*Math.abs(x)/(w*Math.SQRT1_2))+.004;
 }
 const bands=[.25,detective?.015:-.10];
 for(const y of bands){polygon(g,'franja_bordada',[[-.185,y-.012],[.185,y-.012],[.185,y+.012],[-.185,y+.012]],.003,cream,0,[],front);
  for(let j=-2;j<=2;j++){const x=j*.067;polygon(g,'greca_escalonada',[[x-.02,y+.032],[x-.01,y+.032],[x-.01,y+.041],[x+.01,y+.041],[x+.01,y+.032],[x+.02,y+.032],[x+.02,y+.022],[x+.01,y+.022],[x+.01,y+.015],[x-.01,y+.015],[x-.01,y+.022],[x-.02,y+.022]],.003,cream,0,[],front);}
 }
 for(let j=-5;j<=5;j++){const x=j*.028,y=low+Math.abs(x)/.31*.18+(detective?0:x/.31*.085),z=.225*(1-(1-Math.SQRT1_2)*Math.abs(x)/(.31*Math.SQRT1_2));fringe(g,'fleco_poncho',x,y+.006,z+.002,.015,cream,1);}
 // Deformation data keep arm lift response attached to the same original shoulder joints.
 r.reviewPoncho=g;r.g.userData.poncho=true;
 return g;
}
function skirt(r,S){for(const o of [...r.hips.children])if(o.isMesh)r.hips.remove(o);
 const id=r.id,c=mat(S.bottom.c),trim=mat(id==='ines'?0x8c1e3c:id==='amalia'?0x989646:0xe4c39a);
 const ring=id==='ines'?[[.02,.145,.11],[-.14,.21,.145],[-.34,.255,.17],[-.755,.31,.19]]:id==='amalia'?[[.02,.145,.108],[-.18,.19,.132],[-.4,.235,.155],[-.77,.265,.18]]:[[.02,.14,.107],[-.17,.19,.14],[-.43,.23,.155],[-.76,.293,.188]];
 const g=group(r.hips,'falda_una_sola_superficie');
 const skirtMesh=mesh(g,'falda_plegada_con_bajo',loftGeo(ring,16,{a0:0,pleat:.06}),c);skirtMesh.material.side=THREE.DoubleSide;r.reviewSkirt=g;
 for(const [y,w,d]of ring.slice(2)){shell(g,'cenefa_integrada',rows([[y+.023,w-.002,d-.001],[y+.006,w+.001,d+.001]]),trim,8,.004);}
 if(id==='ines')for(const [y,w,d]of[[-.21,.226,.157],[-.40,.27,.18]])shell(g,'volante_angular',rows([[y+.045,w-.014,d-.006],[y,w,d]]),c,8,.006);
 if(id==='devota')for(let j=-3;j<=3;j++)flower(g,'bordado_bajo_falda',j*.055,-.70,.187,.014,trim);
 return g;
}
function wrap(r,S){const id=r.id,c=mat(id==='ines'?0xa0285e:id==='amalia'?0xf0e4cc:0x1f6a66),trim=mat(id==='ines'?0x5a0f1e:id==='amalia'?0x7a1e2e:0xe8d8b8),g=group(r.acc,'rebozo_continuo');
 if(id==='amalia'){
  // Single hollow eight-sided mantle with sloping hem, and a real neck aperture.
  const rings=[[.485,.078,.069],[.38,.235,.142],[.08,.27,.16],[-.17,.252,.17]];const angles=Array.from({length:8},(_,i)=>i*Math.PI/4);const v=[],ix=[];
  for(let k=0;k<4;k++)for(const a of angles)v.push([Math.sin(a)*rings[k][1],rings[k][0]+(k===3?Math.abs(Math.sin(a))*.25:0),Math.cos(a)*rings[k][2]]);
  const N=v.length;v.push(...v.map(([x,y,z])=>[x*.977,y,z*.96]));for(let k=0;k<3;k++)for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8;ix.push(a,b,a+8,b,b+8,a+8,a+N,a+8+N,b+N,b+N,a+8+N,b+8+N);}for(const k of[0,3])for(let j=0;j<8;j++){const a=k*8+j,b=k*8+(j+1)%8;ix.push(a,a+N,b,b,a+N,b+N);}mesh(g,'manta_marfil_continua',geo(v,ix),c);
  for(let j=-2;j<=2;j++)flower(g,'bordado_manta',j*.065,.21,.148-Math.abs(j)*.018,.022,trim);
  fringe(g,'flecos_manta',0,-.17,.175,.27,c,10);
 }else{
  const y=id==='ines'?.29:.38;
  ribbon(g,'banda_sobre_espalda',[[-.21,y-.10,-.08],[-.18,y+.035,-.16],[0,y-.01,-.17],[.18,y+.035,-.16],[.21,y-.10,-.08]],.15,c);
  ribbon(g,'caida_frente_I',[[-.21,y-.10,-.08],[-.2,y-.09,.04],[-.18,y-.16,.13],[-.16,y-.30,.16],[-.21,y-.49,.15]],.12,c);
  ribbon(g,'caida_frente_D',[[.21,y-.10,-.08],[.2,y-.09,.04],[.19,y-.16,.13],[.16,y-.28,.16],[.15,y-.40,.16]],.105,c);
  for(const sd of[-1,1]){flower(g,'motivo_rebozo',sd*.165,y-.23,.17,.025,trim);fringe(g,'fleco',sd*.18,y-(sd<0?.49:.40),.15,.1,trim,5);}
 }
 return g;
}
function hood(r,c){const g=group(r.acc,'capucha_recogida'),dark=mat(0x620e23),cream=mat(CREAM);
 shell(g,'capucha_hueca',rows([[.38,.13,.095,-.055],[.46,.146,.10,-.085],[.55,.116,.076,-.095]]),c,8,.018);
 for(const sd of[-1,1]){segment(g,'cordon_capucha',[sd*.055,.46,.116],[sd*.053,.31,.137],.003,cream);box(g,'terminal_cordon',sd*.053,.303,.137,.006,.018,.007,cream);}
 box(g,'cremallera',0,.21,.13,.009,.39,.006,dark);
 for(const sd of[-1,1])for(const y of[.08,.18,.28,.38])flower(g,'bordado_chaqueta',sd*.076,y,.13,.012,cream);
}
function overalls(r){const b=1.2,c=mat(0xc07a28),dark=mat(0x995722),gold=mat(GOLD),purple=mat(0x72509a);
 shell(r.acc,'cintura_overol',rows([[-.04,.168,.123],[.10,.169,.126]],b),c,8,.012);
 panel(r.acc,'peto_ochre',[[-.123,.09],[.123,.09],[.113,.34],[-.113,.34]],c,.165,.013);
 for(const sd of[-1,1]){ribbon(r.acc,'tirante_overol',[[sd*.10,.13,.18],[sd*.11,.34,.177],[sd*.135,.47,.09],[sd*.13,.4,-.15],[sd*.11,.13,-.158]],.033,c);
  box(r.acc,'hebilla_tirante',sd*.11,.326,.19,.029,.033,.007,gold);box(r.acc,'bolsillo_pierna',sd*.10,-.11,.12,.082,.1,.014,dark);}
 box(r.acc,'bolsillo_peto',0,.21,.189,.15,.079,.012,dark);
 for(const [x,col,h]of[[-.04,0x326a64,.058],[0,0x756389,.048],[.04,0x718786,.067]]){box(r.acc,'herramienta_peto',x,.275,.19,.012,h,.012,mat(col));}
 scarf(r.acc,purple);
}
function makeReviewCharacter(id,{original=false}={}){
 if(original)return makeCharacter(id);
 if(id==='curandero')return makeCharacter(id);
 if(id==='sensitivo')return makeAlexStudy();
 const r=makeCharacter(id),S=CHARS[id],b=S.build||1;const top=mat(S.top),sleeve=mat(id==='mateo'?0x7a2a3a:id==='guardaespaldas'?0xa08a64:S.top),skin=mat(S.skin),dark=mat(B);
 r.acc.clear();r.hair.clear();clearMeshes(r.torso);for(const o of r.head.children.filter(o=>o.isMesh).slice(5))r.head.remove(o);
 // Preserve every original animation group. Only attached mesh geometry is replaced.
 const width=id==='improvisador'?.91:id==='tecnico'?1.03:id==='mateo'?.94:1;
 shell(r.acc,'camisa_entallada',rows([[-.02,.149,.105],[.12,S.fem?.123:.139,.099],[.29,S.fem?.16:.179,.117],[.402,.19,.11],[.48,.112,.081],[.52,.06,.055]],b*width),top,8,.014);
 collar(r.acc,top,b);buttons(r.acc,dark,.123*b);
 for(const arm of[r.armL,r.armR]){
  clearMeshes(arm);solid(arm,'manga_superior_continua',rows([[.022,.046,.046],[-.035,.061,.059],[-.14,.052,.05],[-.27,.044,.044]],b*width),sleeve,6);
  const elbow=arm.userData.elbow;
  // Replace lower sleeve only, retain palm/fingers and hand anchor object identities.
  for(const o of [...elbow.children])if(o.isMesh&&o.position.y===0)elbow.remove(o);
  const rolled=['rafael','tecnico'].includes(id);
  solid(elbow,rolled?'antebrazo_piel':'manga_inferior',rows([[.01,.045,.045],[-.11,.041,.04],[-.21,.034,.032]]),rolled?skin:sleeve,6);
  if(rolled)shell(elbow,'puno_remangado',rows([[.004,.052,.051],[-.055,.051,.05]]),top,6,.008);
  else shell(elbow,'ribete_puno',rows([[-.175,.038,.037],[-.2,.036,.034]]),mat(S.trim||S.top),6,.004);
 }
 hair(r,S);
 if(S.bottom.skirt){skirt(r,S);wrap(r,S);earrings(r);for(let j=-2;j<=2;j++)flower(r.acc,'bordado_blusa',j*.039,.405,.121-Math.abs(j*.039)*.42,.014,mat(S.trim||0x8c1e3c));}
 if(id==='rafael'){vest(r.acc,b,mat(0x4e6a3c),true);scarf(r.acc,mat(0xb02018));}
 if(id==='mateo'){vest(r.acc,b,mat(0x5a0f1e));coat(r,mat(0x7a2a3a));rosary(r.acc,.065,.27,.17);}
 if(id==='tomas'||id==='detective'){poncho(r,mat(S.acc[0][1]),id==='detective');hat(r,id==='detective');bag(r.acc,b,true);}
 if(id==='vigia'){
  vest(r.acc,b,mat(0x8a2232));scarf(r.acc,mat(0x2f6a5e));bag(r.acc,b);
  for(const sd of[-1,1])for(const y of[.1,.22,.34])flower(r.acc,'bordado_chaleco',sd*.095,y,.142,.014,mat(0xd8b030));
 }
 if(id==='improvisador'){hood(r,top);glasses(r,true);}
 if(id==='tecnico')overalls(r);
 if(id==='devota')rosary(r.acc,.075,.23,.18);
 if(id==='guardaespaldas'){coat(r,mat(0xa08a64),true);glasses(r);}
 const mats=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial){m.flatShading=true;m.roughness=1;m.metalness=0;m.userData={c:m.color.getHex(),e:0};mats.add(m);}});r.mats=[...mats];
 r.g.name='NDA_'+id+'_elenco_aprobado';r.g.userData={...r.g.userData,approval:'approved_2026_11_19',identity:DESIGN[id],source:'original procedural rig; anatomy and animation anchors unchanged'};
 return r;
}
function deformCloth(group,fn){
 group.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;if(!o.userData.restPositions)o.userData.restPositions=Array.from(p.array);const a=o.userData.restPositions;
  for(let i=0;i<p.count;i++){const v=fn(a[i*3]+o.position.x,a[i*3+1]+o.position.y,a[i*3+2]+o.position.z);p.setXYZ(i,v[0]-o.position.x,v[1]-o.position.y,v[2]-o.position.z);}p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
 });
}
function animateCharacter(r,s){
 originalAnimate(r,s);const crouch=THREE.MathUtils.clamp((r.hipY-r.hips.position.y)/.42,0,1);
 if(r.reviewSkirt)deformCloth(r.reviewSkirt,(x,y,z)=>[x*(1+.1*crouch),y*(1-.45*crouch),z+crouch*.45*THREE.MathUtils.clamp(-y/.14,0,1)*THREE.MathUtils.clamp(z/.15,0,1)]);
 if(r.reviewPoncho)deformCloth(r.reviewPoncho,(x,y,z)=>{const arm=x<0?r.armR:r.armL,lift=Math.max(0,-arm.rotation.x),w=Math.pow(THREE.MathUtils.clamp((Math.abs(x)-.09)/.23,0,1),2)*THREE.MathUtils.clamp((y+.03)/.25,0,1);return[x,y+lift*.035*w,z+lift*.16*w];});
}

return {makeReviewCharacter,animateCharacter};
})();
function makeCharacter(id){return NDAElencoArt.makeReviewCharacter(CHARS[id]?id:'ines');}
function animateCharacter(r,s){return NDAElencoArt.animateCharacter(r,s);}
