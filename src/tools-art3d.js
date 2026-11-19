// Seven evidence instruments, with silhouettes and readouts tied to real state.
const NDAToolArt=globalThis.NDAToolArt=(()=>{
 const kinds=['termo','uv','grab','cam','emf','espejo','gases'];
 function create(kind){if(!kinds.includes(kind))return null;const g=new THREE.Group(),state={kind,leds:[]};g.name='tool_'+kind;g.userData.tool=state;
 const mat=c=>new THREE.MeshStandardMaterial({color:c,flatShading:true,roughness:1,metalness:0});
 const box=(w,h,d,x,y,z,c)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat(c));m.position.set(x,y,z);g.add(m);m.castShadow=true;return m;};
 const cy=(rt,rb,h,x,y,z,c,n=8)=>{const m=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,n),mat(c));m.position.set(x,y,z);g.add(m);return m;};
 const dark=0x232b30,bone=0xd8cdb5,teal=0x315c5b;
 if(kind==='uv'){cy(.065,.09,.28,0,.14,0,dark);const lens=cy(.09,.09,.025,0,.292,0,0x7751ac);lens.rotation.z=Math.PI/2;box(.16,.025,.10,.02,.21,0,dark);}
 else if(kind==='espejo'){cy(.022,.025,.16,0,.08,0,0x805937,6);const rim=cy(.18,.18,.035,0,.29,0,0xba8d49,8);rim.rotation.x=Math.PI/2;const glass=cy(.15,.15,.04,0,.29,.005,0x78939b,8);glass.rotation.x=Math.PI/2;}
 else if(kind==='cam'){box(.31,.19,.15,0,.23,0,dark);const lens=cy(.075,.075,.10,.19,.23,0,teal);lens.rotation.z=Math.PI/2;box(.10,.045,.14,0,.35,0,dark);state.rec=box(.025,.025,.012,-.10,.28,.08,0x402020);state.legs=[];for(const angle of[0,2.094,4.189]){const leg=box(.025,.22,.025,Math.cos(angle)*.075,.11,Math.sin(angle)*.075,dark);leg.rotation.z=Math.cos(angle)*.4;leg.rotation.x=Math.sin(angle)*.4;state.legs.push(leg);}}
 else {box(.21,.32,.075,0,.17,0,kind==='gases'?0xb18a3f:kind==='termo'?bone:dark);box(.16,.13,.012,0,.23,.044,teal);box(.08,.03,.014,-.025,.10,.047,bone);
  if(kind==='emf')for(let k=0;k<5;k++)state.leds.push(box(.025,.035,.018,-.065+k*.032,.28,.055,0x202520));
  if(kind==='grab'){for(let k=0;k<4;k++)box(.12,.008,.016,0,.15-k*.02,.048,0x131819);cy(.012,.012,.14,-.07,.39,0,dark,4);state.voice=box(.12,.02,.018,0,.24,.055,teal);}
  if(kind==='termo'){state.lcd=box(.09,.015,.018,0,.23,.055,0xbad5b8);box(.045,.10,.07,.065,.37,0,dark);}
  if(kind==='gases'){const dial=cy(.075,.075,.018,0,.24,.054,bone,8);dial.rotation.x=Math.PI/2;state.needle=box(.008,.058,.01,0,.24,.068,0x30343a);cy(.025,.025,.08,.055,.37,0,dark,6);}
 }
 return g;}
 function update(g,it,t,held=false){const s=g?.userData.tool;if(!s)return;if(s.leds.length){const level=t<it.emfUntil?it.emfLvl:1;s.leds.forEach((m,k)=>m.material.color.setHex(k<level?[0x557a43,0x829542,0xc49a37,0xb76d30,0xad3b3a][k]:0x202520));}if(s.needle)s.needle.rotation.z=t<it.redUntil?-1.1:t<it.yellowUntil?-.35:.8;if(s.voice)s.voice.scale.y=it.screen?.kind==='voz'&&t<it.screen.until?1+Math.abs(Math.sin(t*8))*3:1;if(s.lcd)s.lcd.material.color.setHex(it.temp<0?0x9fcadd:0xbad5b8);if(s.rec)s.rec.material.color.setHex(Math.sin(t*2)>.6?0xb5423e:0x402020);for(const leg of s.legs||[])leg.visible=!held;}
 return{create,update};
})();
