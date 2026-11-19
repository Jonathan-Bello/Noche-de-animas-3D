// Primera muestra de la casona: antigua y vivida, terror legible, materiales mate.
const NDAVisualQuality=(()=>{
 const profiles={low:{dpr:1,shadow:0,detail:false},balanced:{dpr:1.35,shadow:768,detail:true},high:{dpr:2,shadow:1024,detail:true}};
 let preference='auto',frameAverage=30,lastAdjust=0,adaptiveScale=1;try{const value=localStorage.getItem('nda_visual_quality');if(['auto','low','balanced','high'].includes(value))preference=value;}catch(e){}
 function current(){const mobile=typeof matchMedia==='function'&&matchMedia('(pointer:coarse)').matches;return profiles[preference==='auto'?(mobile?'low':'balanced'):preference]||profiles.balanced;}
 function select(value){preference=['auto','low','balanced','high'].includes(value)?value:'auto';adaptiveScale=1;frameAverage=30;lastAdjust=0;try{localStorage.setItem('nda_visual_quality',preference);}catch(e){}}
 function frame(renderer,ms,now){if(current()!==profiles.low||!Number.isFinite(ms)||ms<1||ms>250)return;frameAverage=frameAverage*.95+ms*.05;if(!lastAdjust){lastAdjust=now;return;}if(now-lastAdjust<3000)return;const next=frameAverage>40?Math.max(.65,adaptiveScale-.1):frameAverage<24?Math.min(1,adaptiveScale+.05):adaptiveScale;if(Math.abs(next-adaptiveScale)>.001){adaptiveScale=next;renderer.setPixelRatio(Math.min(devicePixelRatio||1,current().dpr)*adaptiveScale);}lastAdjust=now;}
 function apply(renderer,light){const p=current();if(renderer){renderer.setPixelRatio(Math.min(devicePixelRatio||1,p.dpr)*(p===profiles.low?adaptiveScale:1));renderer.shadowMap.enabled=p.shadow>0;}if(light){light.castShadow=p.shadow>0;const size=p.shadow||512;if(light.shadow.mapSize.x!==size){light.shadow.map?.dispose();light.shadow.map=null;light.shadow.mapSize.set(size,size);}}}
 return{get preference(){return preference;},get resolutionScale(){return adaptiveScale;},current,select,apply,frame};
})();
