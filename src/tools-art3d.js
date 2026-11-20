// Shared state adapter and manifest-driven components: workshop, hand and placed tools.
const NDAToolArt=globalThis.NDAToolArt=(()=>{
 const kinds=['termo','uv','grab','cam','emf','espejo','gases'];
 function read(kind,it={},t=0,ctx={}){
  const live=n=>t<(it[n]||0),s={kind,tone:'normal',label:'En espera',digits:'',progress:0};
  if(kind==='termo'){const st=ctx.termo||it.holder?.termo,v=st&&(st.show??st.v);s.progress=Math.min(1,Math.max(0,(st?.settle||0)/8));s.digits=Number.isFinite(v)?(v<0?'-':'')+Math.abs(v).toFixed(1):'----';s.label=s.progress===1?'Lectura asentada':s.progress>0?'Asentando · quieto':'Sostener quieto';s.tone=st&&s.progress===1&&st.v<0?'positive':Number.isFinite(v)&&v<=3?'doubtful':'normal';}
  if(kind==='emf'){s.level=live('emfUntil')?Math.max(1,Math.min(5,it.emfLvl||1)):1;s.digits=String(s.level);s.label='Nivel '+s.level;s.tone=s.level===5?'positive':s.level>1?'doubtful':'normal';}
  if(kind==='grab'){s.wave=it.screen&&t<it.screen.until?it.screen.kind:'nada';s.listening=t<(it.cd||0);s.label=s.wave==='voz'?'Una voz':s.wave==='estatica'?'Estática':s.listening?'Escuchando':'Usar: preguntar';s.tone=s.wave==='voz'?'positive':s.wave==='estatica'?'doubtful':'normal';}
  if(kind==='gases'){s.red=live('redUntil');s.yellow=!s.red&&live('yellowUntil');s.angle=s.red?-1.1:s.yellow?-.35:.8-Math.min(1,Math.max(0,(it.gasAcc||0)/5))*.6;s.tone=s.red?'positive':s.yellow?'doubtful':'normal';s.label=s.red?'Aguja en rojo':s.yellow?'Aguja en amarillo':'Muestreando';}
  if(kind==='espejo'){s.mark=live('markUntil');s.fog=!s.mark&&live('fogUntil');s.tone=s.mark?'positive':s.fog?'doubtful':'normal';s.label=s.mark?'Mano marcada':s.fog?'Vaho':'Superficie limpia';}
  if(kind==='uv'){s.label='Revisar puertas y ceniza';s.uv=!!ctx.uvVisible;}
  if(kind==='cam'){s.deployed=!ctx.held&&!it.holder&&!it.onTable&&it.dir!==undefined;s.label=s.deployed?'Enviando a la base':'G: colocar el tripié';s.digits=String(Number.isInteger(it.tv)?it.tv+1:1);/* ghostOn is private to the base monitor. */}
  if(it.msg&&t<it.msg.until){s.message=it.msg.text;s.tone='message';}
  return s;
 }
 function geometry(p){return p.shape==='box'?new THREE.BoxGeometry(...p.size):new THREE.CylinderGeometry(...p.size.slice(0,3),p.size[3],1,false);}
 function create(kind,{editable=false,definition=globalThis.NDAToolComponents?.tools[kind],stateAdapter=null,applyState=null}={}){
  if(!definition)return null;
  const g=new THREE.Group(),s={kind,leds:[],parts:new Map(),groups:{},definition,editable,stateAdapter,applyState,geometries:new Set(),materials:new Map(),glyphs:new Map()};g.name='tool_'+kind;g.userData.tool=s;
  const material=c=>{if(!s.materials.has(c))s.materials.set(c,new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:1,metalness:0}));return s.materials.get(c);};
  const mesh=(geo,col,parent)=>{s.geometries.add(geo);const mat=parent.userData.part?.role?material(col).clone():material(col);if(parent.userData.part?.role)s.materials.set('dynamic_'+s.materials.size,mat);const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;parent.add(m);return m;};
  for(const name of ['body','stand','folded']){const q=new THREE.Group();q.name=name;s.groups[name]=q;g.add(q);}
  for(const p of definition.parts){const parent=s.groups[p.group],node=new THREE.Group();node.name=p.id;node.position.fromArray(p.position);node.rotation.fromArray([...p.rotation,'XYZ']);parent.add(node);s.parts.set(p.id,node);node.userData.part=p;
   if(p.role==='handprint'){
    const palm=mesh(new THREE.BoxGeometry(p.size[0]*.62,p.size[1]*.4,p.size[2]),p.color,node);palm.position.y=-p.size[1]*.08;
    for(let k=0;k<4;k++){const f=mesh(new THREE.BoxGeometry(p.size[0]*.12,p.size[1]*(.38-Math.abs(1.5-k)*.05),p.size[2]),p.color,node);f.position.set((k-1.5)*p.size[0]*.17,p.size[1]*.23,0);}
    const thumb=mesh(new THREE.BoxGeometry(p.size[0]*.13,p.size[1]*.29,p.size[2]),p.color,node);thumb.position.set(-p.size[0]*.35,-.004,0);thumb.rotation.z=-.65;s.handprint=node;
   }else if(p.role==='digits'){
    mesh(geometry(p),p.color,node);s.digitPanel={node,p,digits:[]};const count=definition.digitCount||(kind==='termo'?4:1),w=p.size[0]/(count+1),h=p.size[1]*.68;
    for(let k=0;k<count;k++){const m=mesh(new THREE.BufferGeometry(),'#233d35',node);m.position.set((k-(count-1)/2)*w,0,p.size[2]/2+.001);m.userData.w=w*.68;m.userData.h=h;s.digitPanel.digits.push(m);}
    if(kind==='termo'){const dot=mesh(new THREE.BoxGeometry(w*.20,w*.20,.002),'#233d35',node);dot.position.set(w*1.0,-h*.50,p.size[2]/2+.0015);}
   }else if(p.role==='wave'){
    mesh(geometry(p),p.color,node);s.wave=[];for(let k=0;k<12;k++){const m=mesh(new THREE.BoxGeometry(p.size[0]/18,.008,.001),'#a9c3ad',node);m.position.set((k-5.5)*p.size[0]/14,0,p.size[2]/2+.001);s.wave.push(m);}
   }else if(p.role==='needle'){const m=mesh(geometry(p),p.color,node);m.position.y=p.size[1]/2;s.needle=node;
   }else{const m=mesh(geometry(p),p.color,node);if(p.role?.startsWith('finger'))m.position.y=p.size[1]/2;if(p.role?.startsWith('emf'))s.leds[Number(p.role.slice(3))]=m;else if(p.role==='settle')s.settle=m;else if(p.role==='record')s.rec=m;else if(p.role==='mirror')s.glass=m;}
  }
  // Fixed parts become one vertex-colored draw per placement group in play.
  if(!editable)for(const q of Object.values(s.groups)){
   const positions=[],colors=[],remove=[];q.updateMatrixWorld(true);
   for(const node of [...q.children]){if(node.userData.part.role)continue;node.traverse(o=>{if(!o.isMesh)return;const geo=o.geometry.index?o.geometry.toNonIndexed():o.geometry.clone();geo.applyMatrix4(o.matrixWorld);const a=geo.attributes.position,c=o.material.color;positions.push(...a.array);for(let i=0;i<a.count;i++)colors.push(c.r,c.g,c.b);geo.dispose();});remove.push(node);}
   if(positions.length){const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();geo.computeBoundingSphere();s.geometries.add(geo);const mat=new THREE.MeshStandardMaterial({vertexColors:true,flatShading:true,roughness:1,metalness:0});s.materials.set('batch_'+q.name,mat);const m=new THREE.Mesh(geo,mat);m.name='fixed_'+q.name;m.castShadow=m.receiveShadow=true;q.add(m);remove.forEach(n=>q.remove(n));}
  }
  update(g,{},0,false);return g;
 }
 const segments={0:'abcdef',1:'bc',2:'abged',3:'abgcd',4:'fgbc',5:'afgcd',6:'afgecd',7:'abc',8:'abcdefg',9:'abfgcd','-':'g',' ':''};
 function digitGeometry(s,ch,w,h){const key=ch+':'+w+':'+h;if(s.glyphs.has(key))return s.glyphs.get(key);const pos=[],th=w*.18;for(const a of segments[ch]??'g'){const horizontal='agd'.includes(a),x=horizontal?0:'fe'.includes(a)?-w/2:w/2,y=a==='a'?h/2:a==='d'?-h/2:a==='g'?0:'fb'.includes(a)?h/4:-h/4;const geo=new THREE.BoxGeometry(horizontal?w:th,horizontal?th:h/2-th,.001).toNonIndexed();geo.translate(x,y,0);pos.push(...geo.attributes.position.array);geo.dispose();}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.computeVertexNormals();g.computeBoundingSphere();s.geometries.add(g);s.glyphs.set(key,g);return g;}
 function update(g,it,t,held=false,ctx={}){const s=g?.userData.tool;if(!s)return;const state=(s.stateAdapter||read)(s.kind,it,t,{...ctx,held});s.state=state;
  const deployed=state.deployed;s.groups.stand.visible=!held&&(s.kind!=='cam'||deployed);s.groups.folded.visible=s.kind==='cam'&&held;s.groups.folded.position.y=.23;s.groups.body.position.y=s.kind==='cam'?(deployed?1.32:.23):0;
  s.leds.forEach((m,k)=>m.material.color.set(k<(state.level||0)?m.parent.userData.part.color:'#202520'));
  if(s.needle)s.needle.rotation.z=s.needle.userData.part.rotation[2]+state.angle;
  if(s.handprint)s.handprint.visible=state.mark;
  if(s.glass)s.glass.material.color.set(state.mark||state.fog?'#b5c2c1':s.glass.parent.userData.part.color);
  if(s.settle)s.settle.scale.x=Math.max(.015,state.progress);
  if(s.rec)s.rec.material.color.set(Math.sin(t*3)>.2?'#b5423e':'#402020');
  s.wave?.forEach((m,k)=>m.scale.y=state.wave==='voz'?1+Math.abs(Math.sin(k*1.3+t*9))*4:state.wave==='estatica'?1+Math.abs(Math.sin(k*7.1+t*27))*1.8:.25);
  if(s.digitPanel){const chars=state.message?'----':state.digits.replace('.','').padStart(s.digitPanel.digits.length,' ');s.digitPanel.digits.forEach((m,k)=>{const ch=chars[k]||' ';if(m.userData.char!==ch){m.geometry=digitGeometry(s,ch,m.userData.w,m.userData.h);m.userData.char=ch;}});}
  if(s.applyState)s.applyState(g,it,t,held,ctx);
 }
 function dispose(g,root=g){const s=g?.userData.tool;if(!s)return;const geos=new Set(s.geometries),mats=new Set(s.materials.values());root.traverse(o=>{if(o.geometry)geos.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});geos.forEach(x=>x.dispose());mats.forEach(x=>x.dispose());}
 const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function panel(kind,it,t,ctx={}){
  const partColor=(id,fallback)=>globalThis.NDAToolComponents?.tools[kind]?.parts.find(p=>p.id===id)?.color||fallback;const s=read(kind,it,t,ctx),text=(v,x=80,y=36,size=17)=>`<text x="${x}" y="${y}" text-anchor="middle" fill="#d8cdb5" font-family="monospace" font-size="${size}">${escape(v)}</text>`;
  let drawing='';
  if(s.message)drawing=text(s.message,80,34,12);
  else if(kind==='termo')drawing=text(s.digits+' °C')+`<rect x="20" y="48" width="120" height="4" fill="#3e514b"/><rect x="20" y="48" width="${120*s.progress}" height="4" fill="#a9c3ad"/>`;
  else if(kind==='emf')drawing=[0,1,2,3,4].map((k)=>`<rect x="${22+k*25}" y="17" width="17" height="24" fill="${k<s.level?partColor('piloto_'+(k+1),['#557a43','#829542','#c49a37','#b76d30','#ad3b3a'][k]):'#303a38'}"/>`+text(k+1,30+k*25,56,10)).join('');
  else if(kind==='grab')drawing=Array.from({length:18},(_,k)=>{const h=s.wave==='voz'?4+Math.abs(Math.sin(k*1.3+t*9))*34:s.wave==='estatica'?3+Math.abs(Math.sin(k*7.1+t*27))*14:2;return `<rect x="${12+k*8}" y="${32-h/2}" width="4" height="${h}" fill="#a9c3ad"/>`;}).join('');
  else if(kind==='gases')drawing=`<path d="M31 49L46 24L68 13L93 13L115 24L130 49" fill="none" stroke="#d8cdb5" stroke-width="2"/><path d="M35 46L49 28" stroke="${partColor('zona_0','#557a43')}" stroke-width="8"/><path d="M69 18L91 18" stroke="${partColor('zona_1','#c49a37')}" stroke-width="8"/><path d="M112 28L125 46" stroke="${partColor('zona_2','#ad3b3a')}" stroke-width="8"/><path d="M80 49L80 19" stroke="#d8cdb5" stroke-width="2" transform="rotate(${-s.angle*180/Math.PI} 80 49)"/>`;
  else if(kind==='espejo')drawing=`<path d="M54 9H106L121 24V44L106 59H54L39 44V24Z" fill="${s.mark||s.fog?'#b5c2c1':'#78939b'}" stroke="#ba8d49" stroke-width="4"/>`+(s.mark?'<path d="M73 45L65 35L68 32L73 36V20H77V32H79V16H83V32H85V19H89V33H91V24H95V39L90 47Z" fill="#435052"/>':s.fog?'<path d="M60 29H99M57 36H103M64 43H96" stroke="#d8ded5" stroke-width="3"/>':'');
  else if(kind==='uv')drawing='<path d="M21 29H58V41H21Z" fill="#7751ac"/><path d="M65 33L104 16V54L65 37Z" fill="#493a62"/><path d="M122 13V55M112 13H134" fill="none" stroke="#d8cdb5" stroke-width="3"/>';
  else if(kind==='cam')drawing=text('● REC · C'+s.digits,80,29,16)+text('VER EN LA BASE',80,49,11);
  return `<svg viewBox="0 0 160 68" role="img" aria-label="${escape(s.message||s.label)}"><rect x="1" y="1" width="158" height="66" fill="#1c2a29" stroke="#53665c"/>${drawing}</svg>`;
 }
 return{version:'instrumentos-v17',kinds,create,update,read,dispose,panel};
})();
