function runAnimaArtContractTest(THREE,beforeSource,source){
 const compile=s=>new Function('THREE',s+';return {makeGhostRig,animateGhostRig};')(THREE),before=compile(beforeSource),after=compile(source),assert=(v,m)=>{if(!v)throw new Error(m);};
 assert(before.animateGhostRig.toString()===after.animateGhostRig.toString(),'Original ghost animation changed');
 function signature(r){let hash=2166136261;const add=v=>{for(const c of String(v))hash=Math.imul(hash^c.charCodeAt(0),16777619);};r.g.traverse(o=>{add(o.type);add(o.position.toArray());add(o.rotation.toArray());add(o.scale.toArray());add(o.visible);if(o.isMesh){for(const v of o.geometry.attributes.position.array)add(v);if(o.geometry.index)for(const v of o.geometry.index.array)add(v);for(const m of(Array.isArray(o.material)?o.material:[o.material])){add(m.type);add(m.color?.getHex());add(m.roughness);add(m.metalness);add(m.opacity);add(m.emissive?.getHex());}}});return hash>>>0;}
 const cases=[];
 for(const look of['velo','blanca','sombra','nino','anciano','humo']){
  const a=before.makeGhostRig(look,null),b=after.makeGhostRig(look,null);
  for(const name of['g','inner','head','arms','ripple','mat','robe','darkM','eyeMat','eyes','fade','opS','prev','speed'])assert(name in b,look+' missing field '+name);
  assert(b.opS===0,'Appearance starts at incorrect fade value');
  if(look==='humo')assert(signature(a)===signature(b),'Original smoke geometry/materials changed');else assert(b.g.userData.approvedArt,'Missing approved art '+look);
  let vertices=0;const meshSet=[];b.g.traverse(o=>{if(o.isMesh){vertices+=o.geometry.attributes.position.count;meshSet.push(o);}});
  for(let k=0;k<600;k++){
   const t=k/60,s={x:t*2.4,y:0,t,dt:1/60,hunt:k>=120&&k<300,blind:k>=300&&k<360,stunned:k>=360&&k<420,op:k>=420?0:1};before.animateGhostRig(a,s);after.animateGhostRig(b,s);
   for(const o of meshSet){assert(o.matrix.elements.every(Number.isFinite),'Invalid matrix '+look);assert(Array.from(o.geometry.attributes.position.array).every(Number.isFinite),'Invalid vertex '+look);}
   if(look==='humo')assert(signature(a)===signature(b),'Original smoke animation diverged at frame '+k);
  }
  assert(b.opS<.001,'Appearance did not fade out');cases.push({look,frames:600,vertices,originalSmokeUnchanged:look==='humo'?true:undefined});
 }
 const labeled=after.makeGhostRig('velo','Ánima de prueba');assert(!!labeled.label&&!labeled.label.visible,'Label contract broken');
 return{passed:true,animationFunctionUnchanged:true,smokePreserved:true,approvedLooks:5,cases};
}
