import * as THREE from '../vendor/three.module.js';
// Neo-Retro Vector Sculpture v04. Centimeters are modeled in meters, Y up, +Z front.
export const MODEL_HEIGHT=1.70,HEAD_UNIT=MODEL_HEIGHT/6.5;
export const palette={
  skin:'#D8A070',hair:'#1A1210',red:'#B32234',wine:'#7A1F2E',teal:'#0E3B44',cream:'#E4C39A',brown:'#594035',boots:'#372C2C',trim:'#B77E49'
};
export function createVectorSculptureMaterial(hexColor,options={
}){
  return new THREE.MeshStandardMaterial({
    color:new THREE.Color(hexColor),flatShading:true,roughness:options.roughness??1,metalness:0,side:options.doubleSided?THREE.DoubleSide:THREE.FrontSide,transparent:options.transparent??false,opacity:options.opacity??1,emissive:new THREE.Color(0),emissiveIntensity:0
  });
} const mats=Object.fromEntries(Object.entries(palette).map(([name,c])=>{
  const m=createVectorSculptureMaterial(c);m.name=name;return[name,m];
}));
export function finalizeHardEdgedGeometry(g){
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
export {mesh,geo,group,solid,shell,polygon,wedge,flower};
