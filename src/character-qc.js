// Geometry repair and continuous joint garments. Keeps the existing animation transforms.
const NDACharacterMeshQC=(()=>{
 const EPS=1e-6,KEY=(x,y,z)=>[x,y,z].map(v=>Math.round(v/EPS)).join(',');
 function repair(input){
  const g=input.index?input.toNonIndexed():input.clone(),p=g.attributes.position,faces=[],keys=[],seen=new Set(),edges=new Map();let removed=0,duplicates=0;
  const area=(a,b,c)=>new THREE.Vector3().subVectors(b,a).cross(new THREE.Vector3().subVectors(c,a)).lengthSq();
  for(let j=0;j<p.count;j+=3){const v=[0,1,2].map(k=>new THREE.Vector3().fromBufferAttribute(p,j+k)),ks=v.map(v=>KEY(v.x,v.y,v.z)),fk=[...ks].sort().join('|');
   if(area(...v)<1e-18){removed++;continue;}if(seen.has(fk)){duplicates++;continue;}seen.add(fk);
   const f=faces.length;faces.push({indices:[j,j+1,j+2],flip:false,component:-1});keys.push(ks);
   for(let k=0;k<3;k++){const a=ks[k],b=ks[(k+1)%3],ek=[a,b].sort().join('|');if(!edges.has(ek))edges.set(ek,[]);edges.get(ek).push({f,dir:a<b?1:-1});}
  }
  const adjacency=faces.map(()=>[]);for(const e of edges.values())if(e.length===2){adjacency[e[0].f].push([e[1].f,e[0].dir===e[1].dir]);adjacency[e[1].f].push([e[0].f,e[0].dir===e[1].dir]);}
  let components=0;
  for(let f=0;f<faces.length;f++)if(faces[f].component<0){const list=[f];faces[f].component=components;
   for(let at=0;at<list.length;at++){const i=list[at];for(const[n,same]of adjacency[i])if(faces[n].component<0){faces[n].component=components;faces[n].flip=faces[i].flip!==same;list.push(n);}}
   let volume=0,closed=true;for(const i of list){const ks=keys[i];for(let k=0;k<3;k++)if(edges.get([ks[k],ks[(k+1)%3]].sort().join('|')).length!==2)closed=false;
    const v=faces[i].indices.map(j=>new THREE.Vector3().fromBufferAttribute(p,j));volume+=(faces[i].flip?-1:1)*v[0].dot(v[1].clone().cross(v[2]))/6;}
   if(closed&&volume<0)for(const i of list)faces[i].flip=!faces[i].flip;components++;
  }
  const out=new THREE.BufferGeometry(),attributes=Object.keys(g.attributes).filter(k=>k!=='normal'),buffers=Object.fromEntries(attributes.map(k=>[k,[]]));let lastMaterial=-1,start=0,count=0;
  const materialAt=j=>{for(const gr of g.groups)if(j>=gr.start&&j<gr.start+gr.count)return gr.materialIndex;return 0;};
  for(const f of faces){const material=materialAt(f.indices[0]);if(material!==lastMaterial){if(count)out.addGroup(start,count,lastMaterial);start=out.attributes?.position?.count||Object.values(buffers)[0].length/g.attributes[attributes[0]].itemSize;count=0;lastMaterial=material;}
   const ids=f.flip?[f.indices[0],f.indices[2],f.indices[1]]:f.indices;for(const j of ids)for(const k of attributes){const a=g.attributes[k];for(let n=0;n<a.itemSize;n++)buffers[k].push(a.array[j*a.itemSize+n]);}count+=3;
  }
  if(count)out.addGroup(start,count,lastMaterial);for(const k of attributes)out.setAttribute(k,new THREE.BufferAttribute(new g.attributes[k].array.constructor(buffers[k]),g.attributes[k].itemSize,g.attributes[k].normalized));
  out.computeVertexNormals();out.computeBoundingBox();out.computeBoundingSphere();out.userData={...input.userData,qc:{removedDegenerate:removed,removedDuplicateFaces:duplicates,components}};g.dispose();return out;
 }
 function tube(parent,name,rings,mats,materialByBand){
  const v=[],ix=[],segments=6;for(const[y,w,d]of rings)for(let j=0;j<segments;j++){const a=j*2*Math.PI/segments;v.push(Math.sin(a)*w,y,Math.cos(a)*d);}
  const g=new THREE.BufferGeometry();for(let k=0;k<rings.length-1;k++){const start=ix.length;for(let j=0;j<segments;j++){const a=k*segments+j,b=k*segments+(j+1)%segments,c=a+segments,d=b+segments;ix.push(a,b,c,b,d,c);}g.addGroup(start,ix.length-start,materialByBand(k));}
  let start=ix.length;for(let j=1;j<segments-1;j++)ix.push(0,j+1,j);g.addGroup(start,ix.length-start,0);start=ix.length;const a=(rings.length-1)*segments;for(let j=1;j<segments-1;j++)ix.push(a,a+j,a+j+1);g.addGroup(start,ix.length-start,materialByBand(rings.length-2));
  g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);const o=new THREE.Mesh(repair(g),mats);g.dispose();o.name=name;o.castShadow=o.receiveShadow=true;parent.add(o);return o;
 }
 function connectJoint(r,parent,joint,rings,mats,band,lo,hi,name){
  const o=tube(parent,name,rings,mats,band),p=o.geometry.attributes.position,rest=p.array.slice(),weight=[];
  for(let i=0;i<p.count;i++){const t=THREE.MathUtils.clamp((-p.getY(i)-lo)/(hi-lo),0,1);weight.push(t*t*(3-2*t));}
  (r.qcJoints||(r.qcJoints=[])).push({mesh:o,joint,rest,weight});o.userData.qcContinuousJoint=true;
 }
 function prepare(r){
  if(r.qcPrepared)return r;r.qcPrepared=true;r.qcJoints=[];
  for(const arm of[r.armL,r.armR]){
   const upper=arm.children.find(o=>o.isMesh),elbow=arm.userData.elbow,lower=elbow.children.find(o=>o.isMesh&&o.position.lengthSq()===0);if(!upper||!lower)continue;
   const sleeve=upper.material,skin=lower.material,rolled=['rafael','tecnico'].includes(r.id),b=CHARS[r.id].build||1,trim=elbow.children.find(o=>o.name==='ribete_puno')?.material||sleeve;
   for(const o of[...arm.children])if(o.isMesh)arm.remove(o);for(const o of[...elbow.children])if(o.isMesh&&o.position.lengthSq()===0)elbow.remove(o);
   connectJoint(r,arm,elbow,[[.025,.047*b,.047*b],[-.035,.061*b,.059*b],[-.14,.052*b,.050*b],[-.21,.048,.047],[-.25,.046,.045],[-.27,.045,.045],[-.29,.044,.044],[-.325,.043,.041],[-.40,.039,.038],[-.445,.038,.037],[-.465,.036,.035],[-.485,.034,.033]],[sleeve,skin,trim],k=>rolled?(k>=7?1:0):(k>=9?2:0),.21,.325,'manga_continua_codo_sellado');
  }
  for(const leg of[r.legL,r.legR]){
   const thigh=leg.children.find(o=>o.isMesh),knee=leg.userData.knee,shin=knee.children.find(o=>o.isMesh&&o.position.lengthSq()===0);if(!thigh||!shin)continue;
   const pants=thigh.material,shoe=knee.children.filter(o=>o.isMesh).find(o=>o.position.y<-.4)?.material||shin.material,b=CHARS[r.id].build||1;
   for(const o of[...leg.children])if(o.isMesh)leg.remove(o);for(const o of[...knee.children])if(o.isMesh&&o.position.lengthSq()===0)knee.remove(o);
   connectJoint(r,leg,knee,[[0,.078*b,.080*b],[-.20,.070*b,.072*b],[-.33,.057,.060],[-.38,.054,.058],[-.41,.054,.058],[-.44,.053,.057],[-.49,.052,.056],[-.57,.050,.055],[-.69,.047,.050],[-.72,.046,.050],[-.835,.046,.050]],[pants,shoe],k=>k>=8?1:0,.33,.49,'pantalon_continuo_rodilla_sellada');
  }
  r.g.traverse(o=>{if(!o.isMesh)return;const old=o.geometry;if(!o.userData.qcContinuousJoint)o.geometry=repair(old);o.userData.qcVertexCount=o.geometry.attributes.position.count;});
  const mats=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))if(m.isMeshStandardMaterial)mats.add(m);});r.mats=[...mats];return r;
 }
 const v=new THREE.Vector3(),bent=new THREE.Vector3(),delta=new THREE.Matrix4(),inv=new THREE.Matrix4();
 function update(r){
  for(const item of r.qcJoints||[]){const {mesh,joint,rest,weight}=item,p=mesh.geometry.attributes.position;joint.updateMatrix();
   for(let i=0;i<p.count;i++){v.fromArray(rest,i*3);bent.copy(v).sub(joint.position).applyQuaternion(joint.quaternion).add(joint.position);v.lerp(bent,weight[i]);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;mesh.geometry.computeVertexNormals();mesh.geometry.computeBoundingSphere();
  }
  if(r.reviewCoat){r.torso.updateMatrix();inv.copy(r.torso.matrix).invert();const deltas=[r.legL,r.legR].map(leg=>{leg.updateMatrix();return new THREE.Matrix4().copy(leg.matrix).multiply(new THREE.Matrix4().makeTranslation(-leg.position.x,-leg.position.y,-leg.position.z));});
   r.reviewCoat.traverse(o=>{if(!o.isMesh)return;const p=o.geometry.attributes.position;if(!o.userData.qcCoatRest)o.userData.qcCoatRest=p.array.slice();const rest=o.userData.qcCoatRest;
    for(let i=0;i<p.count;i++){v.fromArray(rest,i*3).add(o.position);const w=THREE.MathUtils.clamp(-v.y/.40,0,1)*.88;bent.copy(v).applyMatrix4(r.torso.matrix).applyMatrix4(deltas[v.x>=0?0:1]).applyMatrix4(inv);v.lerp(bent,w).sub(o.position);p.setXYZ(i,v.x,v.y,v.z);}p.needsUpdate=true;o.geometry.computeVertexNormals();o.geometry.computeBoundingSphere();
   });
  }
 }
 function pleatedSkirtGeometry(rings){
  const n=16,v=[],ix=[];for(const inner of[false,true])for(const[y,w,d]of rings)for(let j=0;j<n;j++){const a=j*Math.PI*2/n,f=j%2?1.06:1;v.push(Math.sin(a)*(w*f-(inner?.009:0)),y,Math.cos(a)*(d*f-(inner?.009:0)));}
  const N=n*rings.length;for(let k=0;k<rings.length-1;k++)for(let j=0;j<n;j++){const a=k*n+j,b=k*n+(j+1)%n,c=a+n,d=b+n;ix.push(a,b,c,b,d,c,a+N,c+N,b+N,b+N,c+N,d+N);}
  for(const row of[0,rings.length-1])for(let j=0;j<n;j++){const a=row*n+j,b=row*n+(j+1)%n;ix.push(a,a+N,b,b,a+N,b+N);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(v,3));g.setIndex(ix);return g;
 }
 return{prepare,update,repair,pleatedSkirtGeometry};
})();
