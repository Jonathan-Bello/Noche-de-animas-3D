// Authored furniture components keep collision footprints and interaction anchors separate.
const NDAFurnitureArt=globalThis.NDAFurnitureArt=(()=>{
 const catalog=()=>globalThis.NDAFurnitureComponents;
 function create(id,options={}){
  const definition=options.definition||catalog()?.tools[id];if(!definition)return null;
  const g=NDAToolArt.create(id,{...options,definition});g.name='mueble_'+id;g.userData.furniture={id};
  if(definition.category==='hide'){
   const s=g.userData.tool,door=new THREE.Group(),eyes=new THREE.Group();door.name='puerta_refugio';door.position.set(-.425,0,.455);g.add(door,eyes);
   for(const node of s.parts.values()){const r=node.userData.part.role;if(r==='hideDoor'){node.removeFromParent();node.position.sub(door.position);door.add(node);}if(r==='eyes'){node.removeFromParent();eyes.add(node);}}
   eyes.visible=false;g.userData.hide={door,eyes,lock:[...s.parts.values()].find(n=>n.userData.part.role==='lock'),slit:[...s.parts.values()].find(n=>n.userData.part.role==='slit')};
  }return g;
 }
 function append(batch,o){const id=o.modelRef||o.id;if(!catalog()?.tools[id])return false;const g=create(id);g.rotation.y=o.rotation||0;g.updateMatrixWorld(true);const x=(o.rect[0]+o.rect[2])/2,z=(o.rect[1]+o.rect[3])/2;g.traverse(n=>{if(!n.isMesh)return;const geo=n.geometry.clone().applyMatrix4(n.matrixWorld);batch.add(geo,geo.attributes.color?null:n.material.color.getHex(),x,0,z);});NDAToolArt.dispose(g);return true;}
 function demo(kind,phase,held=false){return{it:{kind},ctx:{held}};}
 function read(kind){return{kind,label:'Mueble editable',digits:'',progress:0};}
 return{version:'muebles-v19',get kinds(){return Object.keys(catalog()?.tools||{});},create,append,read,demo,update:()=>{},dispose:NDAToolArt.dispose,panel:()=>'<svg viewBox="0 0 160 68" role="img" aria-label="Mueble"><text x="80" y="36" text-anchor="middle" fill="#d8cdb5" font-size="12">Mueble editable</text></svg>'};
})();
