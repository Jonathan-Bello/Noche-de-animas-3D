// Primera muestra de la casona: antigua y vivida, terror legible, materiales mate.
const NDAVisualQuality=(()=>{
 const profiles={low:{dpr:1,shadow:0,detail:false},balanced:{dpr:1.35,shadow:768,detail:true},high:{dpr:2,shadow:1024,detail:true}};
 let preference='auto';try{const value=localStorage.getItem('nda_visual_quality');if(['auto','low','balanced','high'].includes(value))preference=value;}catch(e){}
 function current(){const mobile=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;return profiles[preference==='auto'?(mobile?'low':'balanced'):preference]||profiles.balanced;}
 function select(value){preference=['auto','low','balanced','high'].includes(value)?value:'auto';try{localStorage.setItem('nda_visual_quality',preference);}catch(e){}}
 function apply(renderer,light){const p=current();if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,p.dpr));renderer.shadowMap.enabled=p.shadow>0;}if(light){light.castShadow=p.shadow>0;const size=p.shadow||512;if(light.shadow.mapSize.x!==size){light.shadow.map?.dispose();light.shadow.map=null;light.shadow.mapSize.set(size,size);}}}
 return{get preference(){return preference;},current,select,apply};
})();
