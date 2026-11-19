function auditGeometry(geometry){
 const p=geometry.attributes.position,idx=geometry.index,edges=new Map(),faces=new Set();let volume=0,degenerate=0,duplicates=0,nonfinite=0,orientationConflicts=0;
 const key=i=>[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*1e6)).join(',');
 for(let i=0;i<p.count;i++)for(let k=0;k<3;k++)if(!Number.isFinite(p.array[i*3+k]))nonfinite++;
 for(let j=0;j<(idx?idx.count:p.count);j+=3){const ids=[0,1,2].map(k=>idx?idx.getX(j+k):j+k),v=ids.map(i=>[p.getX(i),p.getY(i),p.getZ(i)]),[a,b,c]=v,ks=ids.map(key);
  const u=b.map((x,k)=>x-a[k]),w=c.map((x,k)=>x-a[k]),cross=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]];
  if(cross.reduce((s,x)=>s+x*x,0)<1e-18){degenerate++;continue;}
  volume+=(a[0]*(b[1]*c[2]-b[2]*c[1])+a[1]*(b[2]*c[0]-b[0]*c[2])+a[2]*(b[0]*c[1]-b[1]*c[0]))/6;
  const fk=[...ks].sort().join('|');if(faces.has(fk))duplicates++;faces.add(fk);
  for(let k=0;k<3;k++){const a=ks[k],b=ks[(k+1)%3],e=[a,b].sort().join('|'),r=edges.get(e)||{count:0,direction:0};r.count++;r.direction+=a<b?1:-1;edges.set(e,r);}
 }
 let boundary=0,nonmanifold=0;for(const e of edges.values()){if(e.count===1)boundary++;if(e.count>2)nonmanifold++;if(e.count===2&&Math.abs(e.direction)===2)orientationConflicts++;}
 return{vertices:p.count,triangles:(idx?idx.count:p.count)/3,boundary,nonmanifold,orientationConflicts,degenerate,duplicates,volume,nonfinite};
}

function runMeshTopologyContract(THREE,api){
 const allowedPaint=new Set(['masa_2_onda_esculpida_izquierda','masa_3_onda_esculpida_derecha','mecha_nuca_adherida','patilla_recta_-1','patilla_recta_1']);const result={meshes:0,vertices:0,structuralBoundaryEdges:0,decorativeBoundaryEdges:0};
 for(const id of Object.keys(api.CHARS)){const r=api.makeCharacter(id);r.g.traverse(o=>{if(!o.isMesh)return;const a=auditGeometry(o.geometry);result.meshes++;result.vertices+=a.vertices;
  if(a.nonfinite||a.degenerate||a.nonmanifold||a.orientationConflicts)throw new Error(id+'/'+o.name+' invalid topology');
  if(!a.boundary&&a.volume< -1e-8)throw new Error(id+'/'+o.name+' inside-out closed mesh');
  if(a.boundary){if(allowedPaint.has(o.name))result.decorativeBoundaryEdges+=a.boundary;else result.structuralBoundaryEdges+=a.boundary;}
 });}if(result.structuralBoundaryEdges)throw new Error('Unexpected structural boundaries: '+result.structuralBoundaryEdges);return {...result,passed:true};
}
