// No account credential leaves this tab except in Authorization headers to api.github.com.
const api=window.NDAEditor,$=id=>document.getElementById(id),copy=x=>structuredClone(x);
const repo='Jonathan-Bello/Noche-de-animas-3D',endpoint='https://api.github.com/repos/'+repo;
const local=['localhost','127.0.0.1'].includes(location.hostname)&&location.port==='8790';
let token='',user='',peer=null,host=false,upstream=null,connections=new Set(),revision=0,remote=false;
let last=JSON.stringify(api.data),publishedBase=copy(api.base),publishedSHA=null,busy=false,waiting=false,hostReady=false;
const message=(text,bad=false)=>{$('online-message').textContent=text;$('online-message').style.color=bad?'#913c31':'';};
function refresh(){
 $('connect-github').textContent=user?'Conectado: '+user:'Conectar GitHub para publicar';
 $('disconnect-github').hidden=!token;$('publish-github').disabled=busy||api.placing||!!(peer&&!host);
 document.querySelector('main').inert=waiting;
 $('save').disabled=busy||api.placing||!!(peer&&!host);
 if(!local)$('save').textContent='Publicar en el juego';
 $('host-session').disabled=!!peer;$('leave-session').hidden=!peer;
 $('session-state').textContent=!peer?'Sin sala: borrador personal':host?`Sala abierta · ${connections.size} invitado(s) · cambio ${revision}`:upstream?.open?`Conectado a la sala · cambio ${revision}`:'Conectando con el anfitrión…';
}
function friendly(status){return({401:'GitHub rechazó la credencial. Crea un token vigente y vuelve a conectar.',403:'Tu cuenta o token no puede escribir aquí. Selecciona este repositorio y habilita Contents: Read and write.',404:'GitHub no encuentra el repositorio o no te permite verlo con esta credencial.',409:'El repositorio cambió mientras editabas. Descarga tu borrador y carga el plano publicado antes de volver a publicar.',422:'GitHub no pudo aceptar la publicación. Comprueba los permisos y vuelve a intentarlo.',429:'GitHub está limitando las solicitudes. Espera un minuto e inténtalo de nuevo.'})[status]||'No se pudo conectar con GitHub. Comprueba internet e inténtalo de nuevo.';}
async function github(path,options={}){
 const headers={Accept:'application/vnd.github+json',...(token?{Authorization:'Bearer '+token}:{}),...options.headers};
 let r;try{r=await fetch((path.startsWith('https://api.github.com/')?path:endpoint+path),{...options,headers,cache:'no-store'});}catch{throw Error('No se pudo conectar con GitHub. Comprueba tu conexión a internet.');}
 if(!r.ok)throw Error(friendly(r.status));return r.status===204?null:r.json();
}
const encode=text=>{const bytes=new TextEncoder().encode(text);let s='';for(let i=0;i<bytes.length;i+=8192)s+=String.fromCharCode(...bytes.slice(i,i+8192));return btoa(s);};
const decode=content=>new TextDecoder().decode(Uint8Array.from(atob(content.replaceAll('\n','')),c=>c.charCodeAt(0)));
async function latest(){const f=await github('/contents/src/layout-v11.json?ref=main');return{sha:f.sha,layout:JSON.parse(decode(f.content))};}
function same(a,b){if(a===b)return true;if(!a||!b||typeof a!=='object'||typeof b!=='object')return false;const x=Object.keys(a),y=Object.keys(b);return x.length===y.length&&x.every(k=>Object.hasOwn(b,k)&&same(a[k],b[k]));}
function valid(layout){
 if(!layout||JSON.stringify(layout).length>1800000)return ['El plano recibido está vacío o es demasiado grande.'];
 const mutable=new Set(['obstacles','hidingSockets','decorInstances','stairs','roomModules','audit']);
 if(Object.keys(api.base).length!==Object.keys(layout).length||Object.keys(api.base).some(k=>!mutable.has(k)&&!same(api.base[k],layout[k])))return ['El plano cambia muros, puertas o catálogos que esta versión conserva.'];
 if(['obstacles','hidingSockets','decorInstances','stairs'].some(k=>!Array.isArray(layout[k])))return ['El plano no contiene todos los muebles, escondites y escaleras.'];
 return api.check(layout);
}
function setData(layout){remote=true;try{api.replace(layout);last=JSON.stringify(api.data);}finally{remote=false;}refresh();}
function backup(){try{localStorage.setItem('nda_editor_conflicto',JSON.stringify(api.data));$('download-conflict').hidden=false;}catch{}}
function send(conn,payload){if(conn?.open)try{conn.send(payload);}catch{message('Se interrumpió la conexión. Tu borrador sigue en este navegador.',true);}}
function broadcast(reason=''){const packet={kind:'state',revision,layout:api.data,publishedBase,publishedSHA,reason};for(const c of connections)send(c,packet);}
function stop(){for(const c of connections)c.close();connections.clear();upstream?.close();peer?.destroy();peer=null;upstream=null;host=false;waiting=false;hostReady=false;$('invite-link').hidden=$('copy-invite').hidden=true;history.replaceState(null,'',location.pathname);refresh();}
function peerError(e){message(({ 'peer-unavailable':'No se encontró la sala. Pide un enlace nuevo y confirma que el anfitrión tenga abierta su pestaña.', 'network':'No se pudo conectar con la sala. Comprueba internet.', 'webrtc':'No se pudo conectar entre navegadores. Algunas redes bloquean esta conexión; prueba otra red.', 'unavailable-id':'Esa sala ya existe. Crea una sala nueva.'})[e.type]||'La sala perdió la conexión. Tus cambios locales se conservan.',true);if(!hostReady)stop();}
function createPeer(id){if(!window.Peer)throw Error('No cargó la conexión de salas. Comprueba internet y recarga la página.');const p=id?new Peer(id):new Peer();p.on('error',peerError);p.on('disconnected',()=>message('La sala perdió la señal. Conserva la pestaña abierta e intenta reconectar.',true));return p;}
async function loadPeer(){if(window.Peer)return;await new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js';script.onload=resolve;script.onerror=()=>reject(Error('No cargó la conexión de salas. Comprueba internet y vuelve a intentarlo.'));document.head.append(script);});}
async function hostSession(){
 if(peer)return;try{await loadPeer();host=true;peer=createPeer('nda-decor-'+crypto.randomUUID());}catch(e){host=false;message(e.message,true);return;}
 peer.on('open',id=>{hostReady=true;revision=0;last=JSON.stringify(api.data);const url=new URL(location.href);url.hash='sala='+encodeURIComponent(id);$('invite-link').value=url.href;$('invite-link').hidden=$('copy-invite').hidden=false;message('Sala creada. Comparte el enlace de invitación. Mantén esta pestaña abierta; los invitados podrán editar contigo.');refresh();});
 peer.on('connection',conn=>{conn.on('open',()=>{connections.add(conn);send(conn,{kind:'state',revision,layout:api.data,publishedBase,publishedSHA});refresh();});conn.on('data',packet=>{
  if(!packet||packet.kind!=='edit')return;
  if(packet.revision!==revision||api.placing){send(conn,{kind:'state',revision,layout:api.data,publishedBase,publishedSHA,reason:'Otro cambio llegó primero o el anfitrión está colocando una pieza. Guardamos tu intento como borrador de conflicto; vuelve a mover la pieza sobre el plano actualizado.'});return;}
  const errors=valid(packet.layout);if(errors.length){send(conn,{kind:'state',revision,layout:api.data,publishedBase,publishedSHA,reason:'No se aceptó el cambio: '+errors[0]});return;}
  setData(packet.layout);revision++;broadcast();message('Se incorporó el cambio de un invitado. El juego público cambia al pulsar Publicar.');refresh();
 });conn.on('close',()=>{connections.delete(conn);refresh();});conn.on('error',()=>{connections.delete(conn);refresh();});});refresh();
}
async function join(id){
 try{await loadPeer();peer=createPeer();}catch(e){message(e.message,true);return;}
 peer.on('open',()=>{upstream=peer.connect(id,{reliable:true});upstream.on('data',packet=>{
  if(!packet||packet.kind!=='state')return;const errors=valid(packet.layout);if(errors.length){message('No se pudo abrir el plano compartido: '+errors[0],true);return;}
  if(packet.revision<revision)return;
  if(packet.reason||api.placing)backup();revision=packet.revision;publishedBase=packet.publishedBase||publishedBase;publishedSHA=packet.publishedSHA||publishedSHA;waiting=false;hostReady=true;setData(packet.layout);message(packet.reason||'Estás editando con el anfitrión. Los cambios confirmados se comparten; el anfitrión publica el resultado.',!!packet.reason);refresh();
 });upstream.on('close',()=>{message('El anfitrión cerró la sala. Tu copia permanece en este navegador. Puedes descargarla o crear una sala nueva.',true);stop();});upstream.on('error',peerError);});refresh();
}
window.addEventListener('nda-editor-change',()=>queueMicrotask(()=>{
 refresh();if(remote||api.placing||!peer||!hostReady)return;const current=JSON.stringify(api.data);if(current===last)return;
 if(host){last=current;revision++;broadcast();refresh();}
 else if(!waiting){last=current;waiting=true;send(upstream,{kind:'edit',revision,layout:api.data});message('Enviando cambio al anfitrión…');}
}));
$('host-session').onclick=hostSession;$('leave-session').onclick=()=>{stop();message('Saliste de la sala. Tu copia local permanece disponible.');};
$('copy-invite').onclick=async()=>{try{await navigator.clipboard.writeText($('invite-link').value);message('Enlace copiado. Envíalo a tus amigos para editar juntos.');}catch{$('invite-link').select();message('Selecciona y copia el enlace de invitación que aparece arriba.');}};
$('connect-github').onclick=()=>{$('github-help').open=true;$('github-token').focus();};
$('authorize-github').onclick=async()=>{const value=$('github-token').value.trim();$('github-token').value='';if(!value){message('Pega el token en el campo de contraseña del editor para conectar tu cuenta.',true);return;}token=value;try{const profile=await github('https://api.github.com/user');user=profile.login;const data=await latest();if(same(data.layout,publishedBase))publishedSHA=data.sha;message('GitHub conectado como '+user+'. Puedes publicar desde esta pestaña.');$('github-help').open=false;}catch(e){token='';user='';message(e.message,true);}refresh();};
$('disconnect-github').onclick=()=>{token='';user='';$('github-token').value='';message('GitHub desconectado de esta pestaña. La sala sigue abierta.');refresh();};
$('load-published').onclick=async()=>{if(peer&&!host){message('El anfitrión debe cargar el plano publicado para toda la sala.',true);return;}if(api.placing){message('Coloca o cancela la pieza antes de cargar el plano publicado.',true);return;}try{backup();const data=await latest(),errors=valid(data.layout);if(errors.length)throw Error(errors[0]);publishedBase=copy(data.layout);publishedSHA=data.sha;api.replace(data.layout);message('Plano publicado cargado. Puedes recuperar tu distribución anterior con Deshacer.');if(host)broadcast();}catch(e){message(e.message,true);}};
async function pollPublication(id){
 for(let tries=0;tries<100;tries++){
  await new Promise(r=>setTimeout(r,6000));let f;try{f=await github('/contents/editor-publications/status.json?ref=main');}catch{continue;}
  const status=JSON.parse(decode(f.content));if(status.id!==id)continue;
  if(status.state==='rejected'){message('No se publicó: '+api.explainError(status.message),true);busy=false;refresh();return;}
  if(status.state==='validated'){
   try{const run=await github('/actions/runs/'+status.runId);if(run.status!=='completed'){message('Plano validado y guardado en GitHub. Se está actualizando la página del juego…');continue;}if(run.conclusion!=='success')throw Error('El plano quedó guardado en GitHub, pero el despliegue falló. Abre Ver publicación para revisar el resultado.');
    const data=await latest();publishedBase=copy(data.layout);publishedSHA=data.sha;if(host)broadcast();message('Publicado: el juego y el editor público ya usan el plano nuevo. Abre el juego y recarga para verlo.');busy=false;refresh();return;
   }catch(e){if(e.message.includes('despliegue')){message(e.message,true);busy=false;refresh();return;}}
  }
 }
 busy=false;message('La publicación sigue pendiente. Abre Ver publicación para comprobar su estado; puedes seguir editando.',true);refresh();
}
async function publish(){
 if(busy)return;if(peer&&!host){message('Pide al anfitrión que publique el plano compartido.',true);return;}if(api.placing){message('Coloca o cancela la pieza antes de publicar.',true);return;}const errors=api.errors();if(errors.length){api.note('No se puede publicar: '+errors[0],true);message('Corrige los avisos de colocación antes de publicar.',true);return;}
 if(!token){$('github-help').open=true;message('Para actualizar el repositorio, conecta tu cuenta de GitHub con el botón de arriba. Tus amigos no necesitan conectarse.',true);return;}
 busy=true;refresh();try{
  const current=await latest();if(!same(current.layout,publishedBase))throw Error(friendly(409));
  const pending=await github('/contents/editor-publications/request.json?ref=main');
  const previous=JSON.parse(decode(pending.content));if(previous.id){const state=await github('/contents/editor-publications/status.json?ref=main');if(JSON.parse(decode(state.content)).id!==previous.id)throw Error('Ya hay una publicación pendiente. Espera a que termine antes de enviar otro plano.');}
  const id=crypto.randomUUID(),layout=copy(api.data),body={version:1,id,baseSHA:current.sha,layout};
  const result=await github('/contents/editor-publications/request.json',{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Proponer distribución de la casona desde el editor público',branch:'main',sha:pending.sha,content:encode(JSON.stringify(body,null,2)+'\n')})});
  $('publication-link').href='https://github.com/'+repo+'/actions/workflows/publicar-casona.yml';$('publication-link').hidden=false;
  message('Enviado a GitHub. Se están comprobando los accesos, escondites y conexiones entre pisos antes de actualizar el juego.');pollPublication(id);
 }catch(e){busy=false;message(e.message,true);refresh();}
}
$('publish-github').onclick=publish;if(!local)$('save').onclick=publish;
$('download-conflict').onclick=()=>{const content=localStorage.getItem('nda_editor_conflicto');if(!content)return;const url=URL.createObjectURL(new Blob([content],{type:'application/json'})),a=document.createElement('a');a.href=url;a.download='casona-intento-anterior.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
window.NDAOnline={get canPublish(){return !!token&&(!peer||host);},get revision(){return revision;},get host(){return host;},get connected(){return !!peer;},valid,refresh};
const invitation=new URLSearchParams(location.hash.slice(1)).get('sala');if(invitation&&/^nda-decor-[a-zA-Z0-9-]{10,80}$/.test(invitation))join(invitation);
refresh();
