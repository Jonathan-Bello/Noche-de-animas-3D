function runElencoArtContractTest(THREE, baselineSource, source) {
  const compile=s=>new Function('THREE',s+'\nreturn {CHARS,makeCharacter,animateCharacter};')(THREE);
  const before=compile(baselineSource),after=compile(source),assert=(v,m)=>{if(!v)throw new Error(m);};
  assert(JSON.stringify(before.CHARS)===JSON.stringify(after.CHARS),'CHARS configuration changed');
  assert(after.makeCharacter('unknown').id==='ines','Unknown character fallback failed');
  const cases=[];
  for(const id of Object.keys(before.CHARS))for(const pose of['neutral','walk','run','tool','crouch','throw','dead','spirit']){
    const a=before.makeCharacter(id),b=after.makeCharacter(id);a.seed=b.seed=0;
    for(let k=0;k<140;k++){const t=k/60,s={x:(pose==='walk'?2.2:pose==='run'?3.7:0)*t,y:0,t,dt:1/60,hidden:pose==='crouch',dead:pose==='dead'||pose==='spirit',manifest:pose==='spirit',lamp:pose==='tool',holding:pose==='tool',aim:pose==='tool',tremble:0};
      if(pose==='throw')a.t.throw=b.t.throw=t-.25;if(pose!=='neutral'){before.animateCharacter(a,s);after.animateCharacter(b,s);}}
    a.g.updateMatrixWorld(true);b.g.updateMatrixWorld(true);let max=0;
    for(const key of['root','body','hips','torso','head','armL','armR','legL','legR','hand','handR'])max=Math.max(max,a[key].getWorldPosition(new THREE.Vector3()).distanceTo(b[key].getWorldPosition(new THREE.Vector3())));
    for(const key of['armL','armR'])max=Math.max(max,a[key].userData.elbow.getWorldPosition(new THREE.Vector3()).distanceTo(b[key].userData.elbow.getWorldPosition(new THREE.Vector3())));
    b.g.traverse(o=>{if(o.isMesh)assert(Array.from(o.geometry.attributes.position.array).every(Number.isFinite),id+' nonfinite geometry');});
    assert(max<1e-8,id+' changed joints in '+pose);cases.push({id,pose,maxJointDifferenceMeters:max});
  }
  const signature=g=>{const s=[];g.traverse(o=>{if(o.isMesh)s.push(Array.from(o.geometry.attributes.position.array).join(','));});return s.join('|');};
  const a=after.makeCharacter('curandero'),s=after.makeCharacter('sensitivo'),t=after.makeCharacter('tecnico');
  assert(signature(a.hair)===signature(s.hair),'Sensitivo hair must match Alex');
  assert(!!a.head.getObjectByName('alex_lentes_redondos'),'Curandero needs round glasses');
  assert(!s.head.getObjectByName('alex_lentes_redondos'),'Sensitivo must have no glasses');
  assert(!!s.head.getObjectByName('maquillaje_catrin_rojo'),'Missing catrin paint');
  assert(!!s.acc.getObjectByName('camisa_roja_bordado_oscuro'),'Missing red embroidered shirt');
  let purple=false;t.g.traverse(o=>{if(o.isMesh&&o.material?.color?.getHex()===0x72509a)purple=true;});assert(purple,'Technician needs purple scarf');
  const allMats=r=>{const set=new Set();r.g.traverse(o=>{if(o.isMesh)for(const m of(Array.isArray(o.material)?o.material:[o.material]))set.add(m);});return set;};
  for(const id of Object.keys(after.CHARS)){const x=allMats(after.makeCharacter(id)),y=allMats(after.makeCharacter(id));assert(![...x].some(m=>y.has(m)),id+' shares materials across instances');}
  return{passed:true,characters:13,posesPerCharacter:8,cases,sharedAlexHair:true,redCatrin:true,redEmbroideredShirt:true,technicianPurple:true,isolatedMaterials:true};
}
