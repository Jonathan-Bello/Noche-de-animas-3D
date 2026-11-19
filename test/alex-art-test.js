function runAlexArtContractTest(THREE, baselineSource, charsSource, artSource) {
  const compile = source => new Function('THREE', source + '\nreturn {makeCharacter:typeof makeCharacter==="function"?makeCharacter:makeBaseCharacter,animateCharacter:typeof animateCharacter==="function"?animateCharacter:animateBaseCharacter,CHARS};')(THREE);
  const baseline = compile(baselineSource), revised = compile(charsSource + '\n' + artSource);
  const assert = (condition, message) => { if (!condition) throw new Error(message); };
  assert(baseline.animateCharacter.toString().replace('function animateCharacter(', 'function animateBaseCharacter(') === revised.animateCharacter.toString(), 'animateCharacter changed');
  assert(JSON.stringify(baseline.CHARS) === JSON.stringify(revised.CHARS), 'Character configuration changed');
  function signature(r) {
    let hash = 2166136261;
    const add = value => { const text=String(value); for (let i=0;i<text.length;i++) hash=Math.imul(hash^text.charCodeAt(i),16777619); };
    r.g.traverse(o => {if(!o.isMesh)return;add(o.position.toArray());add(o.rotation.toArray());add(o.scale.toArray());
      for (const value of o.geometry.attributes.position.array) add(value);
      if(o.geometry.index)for(const value of o.geometry.index.array)add(value);
      for(const m of(Array.isArray(o.material)?o.material:[o.material])) { add(m.color.getHex());add(m.roughness);add(m.metalness); }
    });return hash>>>0;
  }
  const unchanged=[];
  for(const id of Object.keys(baseline.CHARS)) if(id!=='curandero') {
    assert(signature(baseline.makeCharacter(id))===signature(revised.makeCharacter(id)),id+' was modified');unchanged.push(id);
  }
  const cases=[];
  for(const pose of ['neutral','walk','run','tool','crouch','throw','dead','spirit']) {
    const a=baseline.makeCharacter('curandero'),b=revised.makeCharacter('curandero');a.seed=b.seed=0;
    for(let k=0;k<150;k++) {
      const t=k/60,state={x:(pose==='walk'?2.2:pose==='run'?3.7:0)*t,y:0,t,dt:1/60,hidden:pose==='crouch',dead:pose==='dead'||pose==='spirit',manifest:pose==='spirit',lamp:pose==='tool',holding:pose==='tool',aim:pose==='tool',tremble:0};
      if(pose==='throw')a.t.throw=b.t.throw=t-.25;
      baseline.animateCharacter(a,state);revised.animateCharacter(b,state);
    }
    a.g.updateMatrixWorld(true);b.g.updateMatrixWorld(true);let max=0;
    for(const key of ['root','body','hips','torso','head','armL','armR','legL','legR','hand','handR'])max=Math.max(max,a[key].getWorldPosition(new THREE.Vector3()).distanceTo(b[key].getWorldPosition(new THREE.Vector3())));
    for(const key of ['armL','armR'])max=Math.max(max,a[key].userData.elbow.getWorldPosition(new THREE.Vector3()).distanceTo(b[key].userData.elbow.getWorldPosition(new THREE.Vector3())));
    for(const key of ['legL','legR'])max=Math.max(max,a[key].userData.knee.getWorldPosition(new THREE.Vector3()).distanceTo(b[key].userData.knee.getWorldPosition(new THREE.Vector3())));
    assert(max<1e-8,pose+' joint transforms changed');cases.push({pose,maxJointDifferenceMeters:max});
    b.g.traverse(o=>{if(o.isMesh)for(const value of o.geometry.attributes.position.array)assert(Number.isFinite(value),'Non-finite vertex');});
  }
  const a=revised.makeCharacter('curandero'),b=revised.makeCharacter('curandero');
  assert(a.head.getObjectByName('alex_lentes_redondos'),'Round frames missing');
  assert(a.acc.getObjectByName('chaleco_abierto_ajustado_a_camisa').userData.armholes,'Vest armholes missing');
  for(const m of a.mats)assert(!b.mats.includes(m),'Materials are shared across instances');
  return {passed:true,animationFunctionUnchanged:true,unchangedCharacters:unchanged,cases,roundFrames:true,armholes:true,isolatedMaterials:true};
}
