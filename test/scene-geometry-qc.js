// Audit the actual world-space triangles; no rendering or Three.js dependency.
function auditSceneGeometry(scene){
 scene.updateMatrixWorld(true);const planes=new Map(),result={portals:0,nonFinite:0,mixedFaceColors:0,coplanarOverlaps:[]};
 const area=p=>Math.abs(p.reduce((s,v,i)=>{const q=p[(i+1)%p.length];return s+v[0]*q[1]-q[0]*v[1];},0))/2;
 const cross=(a,b,p)=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);
 function overlap(a,b){let out=a.map(v=>v.slice());const sign=Math.sign(cross(b[0],b[1],b[2]));for(let k=0;k<3&&out.length;k++){const c=b[k],d=b[(k+1)%3],input=out;out=[];for(let j=0;j<input.length;j++){const p=input[j],q=input[(j+1)%input.length],cp=sign*cross(c,d,p),cq=sign*cross(c,d,q),pin=cp>=-1e-8,qin=cq>=-1e-8;if(pin)out.push(p);if(pin!==qin){const t=cp/(cp-cq);out.push([p[0]+t*(q[0]-p[0]),p[1]+t*(q[1]-p[1])]);}}}return out.length>=3?area(out):0;}
 scene.traverse(o=>{if(!o.isMesh)return;const p=o.geometry?.attributes.position;if(!p)return;const color=o.geometry.attributes.color,index=o.geometry.index,portal=o.name.includes(':portal_'),wall=o.name.startsWith('muros_');if(portal)result.portals++;
  for(const v of o.matrixWorld.elements)if(!Number.isFinite(v))result.nonFinite++;
  for(const v of p.array)if(!Number.isFinite(v))result.nonFinite++;
  const count=index?index.count:p.count,m=o.matrixWorld.elements;
  for(let k=0;k<count;k+=3){const ids=[0,1,2].map(j=>index?index.getX(k+j):k+j);
   if(o.userData.NDAHouseArt&&color)for(const j of[1,2])for(let c=0;c<3;c++)if(Math.abs(color.array[ids[0]*3+c]-color.array[ids[j]*3+c])>1e-7)result.mixedFaceColors++;
   if(!portal&&!wall)continue;
   const v=ids.map(i=>{const x=p.getX(i),y=p.getY(i),z=p.getZ(i);return[m[0]*x+m[4]*y+m[8]*z+m[12],m[1]*x+m[5]*y+m[9]*z+m[13],m[2]*x+m[6]*y+m[10]*z+m[14]];});
   const axis=[0,1,2].find(a=>Math.max(...v.map(p=>p[a]))-Math.min(...v.map(p=>p[a]))<1e-5);if(axis===undefined)continue;const key=axis+':'+Math.round(v[0][axis]*10000),xy=v.map(p=>p.filter((_,j)=>j!==axis));if(area(xy)<1e-8)continue;const t={xy,portal,name:o.name,id:k,bounds:[Math.min(...xy.map(v=>v[0])),Math.min(...xy.map(v=>v[1])),Math.max(...xy.map(v=>v[0])),Math.max(...xy.map(v=>v[1]))]};if(!planes.has(key))planes.set(key,[]);planes.get(key).push(t);
  }
 });
 for(const ts of planes.values())for(let i=0;i<ts.length;i++)for(let j=i+1;j<ts.length;j++){const a=ts[i],b=ts[j];if(!a.portal&&!b.portal)continue;if(a.bounds[0]>=b.bounds[2]-1e-6||a.bounds[2]<=b.bounds[0]+1e-6||a.bounds[1]>=b.bounds[3]-1e-6||a.bounds[3]<=b.bounds[1]+1e-6)continue;const n=overlap(a.xy,b.xy);if(n>1e-5&&result.coplanarOverlaps.length<20)result.coplanarOverlaps.push({a:a.name,b:b.name,area:n});}
 return result;
}
