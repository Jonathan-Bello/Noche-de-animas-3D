// Cinco apariencias aprobadas; humo conserva exactamente la fabrica original.
const NDAAnimaArt=(()=>{
function polygon(parent,name,points,t,material,z=0,holes=[],surface=null){
 const shape=new THREE.Shape();shape.moveTo(...points[0]);for(const p of points.slice(1))shape.lineTo(...p);shape.closePath();
 for(const points of holes){const hole=new THREE.Path();hole.moveTo(...points[0]);for(const p of points.slice(1))hole.lineTo(...p);hole.closePath();shape.holes.push(hole);}
 let g=new THREE.ExtrudeGeometry(shape,{depth:t,steps:1,bevelEnabled:false,curveSegments:1});if(surface){const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,surface(p.getX(i),p.getY(i))-t+p.getZ(i));}
 const o=new THREE.Mesh(NDACharacterMeshQC.repair(g),material);g.dispose();o.name=name;o.position.z=z;o.castShadow=true;parent.add(o);return o;
}
const LOOKS=['velo','blanca','sombra','nino','anciano','humo'];
const NOTES={
 velo:{name:'La Encapuchada',idea:'Rebozo de papel picado con calados reales, capucha profunda y cinco paños angulares. Guinda, magenta y sombra ciruela.',motion:'Reposo: pliegues quietos y oscilación lenta. Cacería: torso inclinado y brazos hacia delante. Desvanecer: quedan primero los calados y la silueta.'},
 blanca:{name:'Mujer de blanco',idea:'Vestido marfil largo, tres pliegues dominantes y cabello oscuro en dos masas. Un faldón más largo rompe la simetría.',motion:'Reposo: silueta vertical y cabello pesado. Cacería: mangas y manos adelantadas. Desvanecer: el vestido pierde densidad sin aura.'},
 sombra:{name:'Sombra alta',idea:'Columna estrecha, hombros triangulares y brazos desproporcionados con tres dedos angulares. Violeta casi negro.',motion:'Reposo: figura inmóvil con microbalanceo. Cacería: gesto adelantado de brazos largos. La identidad se lee por la proporción, no por brillo.'},
 nino:{name:'Niño en camisón',idea:'Camisón hueso cerrado, cuello antiguo, puños amplios y dos pies pequeños. Escala infantil conservada.',motion:'Reposo: figura recogida. Cacería: brazos al frente y desplazamiento entrecortado. Sin sangre ni rostro de cadáver.'},
 anciano:{name:'Anciano del sarape',idea:'Silueta ancha y baja, sombrero existente, sarape vino de ocho planos con franjas crema/ocre y bastón facetado.',motion:'Reposo: peso visual bajo y pausado. Cacería: avance inclinado. El sarape sigue siendo el ancla de identidad.'},
 humo:{name:'Nube con ojos',idea:'Tres volutas angulares con huecos grandes, color petróleo y pequeños ojos ámbar. Reemplaza los discos apilados por espacio vacío.',motion:'Reposo: volutas a distinta velocidad. Cacería: masa más compacta y ojos al frente. Desvanecer: se desarman las tres capas.'}
};
function mat(r,hex){const m=new THREE.MeshStandardMaterial({color:hex,flatShading:true,roughness:1,metalness:0,transparent:true,opacity:.9,depthWrite:true,side:THREE.DoubleSide});r.fade.push(m);return m;}
function mesh(r,parent,name,g,m){const o=new THREE.Mesh(NDACharacterMeshQC.repair(g),m);o.name=name;o.castShadow=true;parent.add(o);return o;}
function robe(r,name,rows,m,seg=8){const o=mesh(r,r.inner,name,loftGeo(rows,seg,{capB:true,capT:true,a0:0}),m);r.ripple.push(o);return o;}
function patch(r,name,points,m,z,holes=[]){return polygon(r.inner,name,points,.015,m,z,holes);}
function box(r,name,w,h,d,x,y,z,m){const o=mesh(r,r.inner,name,new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);return o;}
function diamond(x,y,w,h){return[[x,y-h],[x+w,y],[x,y+h],[x-w,y]];}
function makeApproved(look,labelText){
 const r=makeBaseGhostRig(look,labelText);
 for(const o of [...r.inner.children])if(o.isMesh)r.inner.remove(o);r.ripple=[];
 r.fade.forEach(m=>{m.roughness=1;m.metalness=0;m.emissive?.setHex(0);});
 const main=r.mat,deep=r.robe,bone=mat(r,0xe9ddc6),warm=mat(r,0xc49c5c);
 if(look==='velo'){
  robe(r,'manto_guinda',[[.02,.45,.30],[.55,.34,.24],[1.15,.22,.16],[1.42,.17,.13]],deep);
  patch(r,'interior_oscuro_capucha',[[-.14,1.42],[.14,1.42],[.15,1.69],[0,1.83],[-.15,1.69]],r.darkM,-.015);
  patch(r,'capucha_papel',[[-.22,1.38],[-.25,1.65],[-.15,1.9],[0,1.98],[.15,1.9],[.25,1.65],[.22,1.38]],main,.015,[[[-.12,1.44],[.12,1.44],[.13,1.67],[0,1.80],[-.13,1.67]]]);
  for(let j=-2;j<=2;j++){
   const x=j*.145,y0=.08+Math.abs(j)*.09,y1=1.28-Math.abs(j)*.12,w=.13;
   const holes=[diamond(x,y0+.20,.028,.052),diamond(x,y0+.44,.028,.052)];
   polygon(r.inner,'pano_calado_'+j,[[x-w/2,y0],[x+w/2,y0+.025],[x+w/2,y1],[x-w/2,y1]],.013,main,0,holes,(x,y)=>.318-y*.13);
  }
 }else if(look==='blanca'){
  robe(r,'vestido_blanco',[[0,.38,.25],[.50,.29,.20],[1.02,.19,.14],[1.35,.17,.12],[1.48,.08,.07]],main);
  for(const sd of[-1,1])patch(r,'cabello_pesado',[[sd*.09,.90],[sd*.16,1.04],[sd*.17,1.57],[sd*.10,1.74],[0,1.75],[sd*.04,1.68],[sd*.10,1.62],[sd*.105,1.20]],mat(r,0x201722),-.015);
  const c=mat(r,0xd5c7ad);
  for(let j=-1;j<=1;j++){const x=j*.18;polygon(r.inner,'pliegue_largo',[[x-.025,.04],[x+.02,.09],[x*.45+.025,1.17],[x*.45-.025,1.17]],.006,c,0,[],(x,y)=>.26-y*.10);}
  patch(r,'cola_asimetrica',[[-.36,.04],[-.45,-.10],[-.23,.11],[-.12,.57]],main,.14);
 }else if(look==='sombra'){
  robe(r,'columna_oscura',[[.02,.15,.11],[.6,.11,.09],[1.45,.16,.12],[1.9,.25,.13],[2.03,.08,.07]],main,6);
  for(const sd of[-1,1])patch(r,'hombro_punta',[[sd*.05,1.98],[sd*.32,1.86],[sd*.22,1.47]],deep,.018);
  for(const arm of r.arms){for(const o of [...arm.children])arm.remove(o);
   mesh(r,arm,'brazo_largo',loftGeo([[0,.041,.039],[-.7,.03,.028],[-1.35,.018,.019]],6,{capB:true,capT:true}),main);
   for(let j=-1;j<=1;j++){const o=mesh(r,arm,'dedo_sombra',new THREE.ConeGeometry(.013,.22+(j===0?.04:0),4),r.darkM);o.position.set(j*.024,-1.42,.0);o.rotation.z=Math.PI;}
  }
 }else if(look==='nino'){
  robe(r,'camison_antiguo',[[.12,.22,.16],[.48,.18,.13],[.86,.14,.10],[.96,.06,.05]],main);
  for(const sd of[-1,1])box(r,'pie_descalzo',.055,.09,.10,sd*.06,.05,.035,r.darkM);
  patch(r,'cuello_camison',[[-.065,.94],[0,.88],[.065,.94],[.083,.88],[0,.84],[-.083,.88]],bone,.08);
  const trim=mat(r,0xaa8c68);for(const y of[.81,.73,.65])box(r,'boton_camison',.011,.011,.01,0,y,.12,trim);
  polygon(r.inner,'dobladillo_antiguo',[[-.16,.16],[.16,.16],[.17,.19],[-.17,.19]],.004,bone,.151);
 }else if(look==='anciano'){
  robe(r,'ropa_interior',[[.06,.18,.14],[.76,.19,.15],[1.35,.14,.12]],bone);
  robe(r,'sarape_vino',[[.60,.43,.25],[1.01,.35,.20],[1.36,.23,.15],[1.45,.07,.06]],main);
  for(const y of[.75,.98,1.18])polygon(r.inner,'franja_sarape',[[-.26,y-.017],[.26,y-.017],[.26,y+.017],[-.26,y+.017]],.006,y===.98?warm:bone,0,[],(x,yy)=>.30-(yy-.6)*.19-Math.abs(x)*.1);
  const cane=mesh(r,r.inner,'baston_facetado',new THREE.CylinderGeometry(.016,.022,1.14,5),warm);cane.position.set(.40,.57,.12);cane.rotation.z=-.10;
 }
 r.g.traverse(o=>{if(o.isMesh&&o.geometry){o.geometry=NDACharacterMeshQC.repair(o.geometry);}});
 r.g.userData={approvedArt:true,approved:true,look,notes:NOTES[look],animation:'existing 12 fps supernatural movement',scope:'appearance only; no evidence or identity rules changed'};return r;
}

return {makeApproved};
})();
function makeGhostRig(look,labelText){
 if(!['velo','blanca','sombra','nino','anciano'].includes(look))return makeBaseGhostRig(look,labelText);
 return NDAAnimaArt.makeApproved(look,labelText);
}
