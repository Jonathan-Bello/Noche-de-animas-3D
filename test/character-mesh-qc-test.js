async function runCharacterMeshStressTest(THREE,api){
 const poses=['idle','walk','run','lamp','aim','holding','crouch','crouchAim','use','dip','throw','runThrow','death','spirit'];
 const report={passed:true,framesPerCase:240,poses,characters:[],verticesInspected:0,frames:0,maxJointSeamGap:0,nonfinite:0,collapsedJointTriangles:0};
 const key=(x,y,z)=>[x,y,z].map(v=>Math.round(v*1e6)).join(',');
 for(const id of Object.keys(api.CHARS)){
  const summary={id,frames:0,verticesInspected:0,maxJointSeamGap:0,nonfinite:0,collapsedJointTriangles:0};
  for(const pose of poses){const r=api.makeCharacter(id);r.seed=0;const meshes=[];r.g.traverse(o=>{if(o.isMesh)meshes.push(o);});
   const jointPairs=[];for(const item of r.qcJoints||[]){const map=new Map(),p=item.mesh.geometry.attributes.position;for(let i=0;i<p.count;i++){const k=key(p.getX(i),p.getY(i),p.getZ(i));if(map.has(k))jointPairs.push([p,map.get(k),i]);else map.set(k,i);}}
   for(let k=0;k<240;k++){const t=k/60,run=pose==='run'||pose==='runThrow',moving=run||pose==='walk',s={x:moving?t*(run?3.7:2.2):0,y:0,t,dt:1/60,hidden:pose==='crouch'||pose==='crouchAim',dead:pose==='death'||pose==='spirit',manifest:pose==='spirit',lamp:['lamp','aim','crouchAim'].includes(pose),aim:['aim','crouchAim'].includes(pose),holding:['holding','use'].includes(pose),tremble:pose==='aim'?.8:0};
    if(['use','dip','throw','runThrow'].includes(pose)&&k%70===5)r.t[pose==='use'?'use':pose==='dip'?'dip':'throw']=t;
    api.animateCharacter(r,s);summary.frames++;
    for(const o of meshes){const p=o.geometry.attributes.position;summary.verticesInspected+=p.count;for(const n of p.array)if(!Number.isFinite(n))summary.nonfinite++;}
    for(const[p,a,b]of jointPairs){const d=Math.hypot(p.getX(a)-p.getX(b),p.getY(a)-p.getY(b),p.getZ(a)-p.getZ(b));summary.maxJointSeamGap=Math.max(summary.maxJointSeamGap,d);}
    // Check every triangle of the four continuous joint tubes throughout the motion.
    for(const item of r.qcJoints||[]){const p=item.mesh.geometry.attributes.position;for(let j=0;j<p.count;j+=3){const ax=p.getX(j+1)-p.getX(j),ay=p.getY(j+1)-p.getY(j),az=p.getZ(j+1)-p.getZ(j),bx=p.getX(j+2)-p.getX(j),by=p.getY(j+2)-p.getY(j),bz=p.getZ(j+2)-p.getZ(j),area=(ay*bz-az*by)**2+(az*bx-ax*bz)**2+(ax*by-ay*bx)**2;if(area<1e-18)summary.collapsedJointTriangles++;}}
   }
  }
  report.characters.push(summary);for(const k of['frames','verticesInspected','nonfinite','collapsedJointTriangles'])report[k]+=summary[k];report.maxJointSeamGap=Math.max(report.maxJointSeamGap,summary.maxJointSeamGap);
  await new Promise(resolve=>setTimeout(resolve,0));
 }
 report.passed=report.nonfinite===0&&report.collapsedJointTriangles===0&&report.maxJointSeamGap<1e-7;return report;
}
