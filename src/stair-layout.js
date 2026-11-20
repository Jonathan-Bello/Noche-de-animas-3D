// Shared structural transforms: geometry, navigation, void and reservations travel together.
(function(root){
 const defaults=[[[[11,26],[10,26],[9,26],[8,26],[7,26],[7,25]],[[7,25],[7,24],[8,24],[9,24],[10,24],[11,24]]],[[[38,2],[39,2],[40,2],[41,2]],[[41,2],[42,2],[43,2],[44,2],[45,2]]]];
 const names={principal:'Escalera principal',servicio:'Escalera de servicio'};
 function paths(s,k){return s.navPaths||defaults[k];}
 function translate(d,id,dx,dz){
  const s=d.stairs.find(s=>s.id===id),k=d.stairs.indexOf(s);if(!s||!Number.isInteger(dx)||!Number.isInteger(dz))throw Error('La escalera debe moverse en casillas completas de 1 metro.');
  s.navPaths=paths(s,k).map(p=>p.map(([x,z])=>[x+dx,z+dz]));
  for(const key of ['hole','clearance'])if(s[key])s[key]=s[key].map((v,i)=>v+(i%2?dz:dx));
  for(const key of ['lowerAnchor','upperAnchor'])s[key]=[s[key][0]+dx,s[key][1]+dz];
  s.path=s.path.map(([x,z,h])=>[x+dx,z+dz,h]);
  s.landingRails=s.landingRails?.map(([a,b,c,e,h])=>[a+dx,b+dz,c+dx,e+dz,h]);if(!s.landingRails)delete s.landingRails;
  for(const o of d.obstacles.filter(o=>o.id==='reserva_escalera_'+id))o.rect=o.rect.map((v,i)=>v+(i%2?dz:dx));
 }
 function errors(d){const e=[],overlap=(a,b)=>a[0]<b[2]-.001&&a[2]>b[0]+.001&&a[1]<b[3]-.001&&a[3]>b[1]+.001;
  d.stairs.forEach((s,k)=>{const name=names[s.id]||s.id;
   for(const[f,rid]of[[0,s.lower],[1,s.upper]]){const r=d.rooms.find(r=>r.id===rid),res=d.obstacles.find(o=>o.floor===f&&o.id==='reserva_escalera_'+s.id);if(!r||!res){e.push(name+': falta la reserva de espacio entre pisos.');continue;}
    if(res.rect[0]<r.rect[0]||res.rect[1]<r.rect[1]||res.rect[2]>r.rect[2]||res.rect[3]>r.rect[3])e.push(name+': debe quedar dentro de '+r.name+' y de su cuarto conectado en el otro piso.');
    for(const p of paths(s,k).flat())if(p[0]<r.rect[0]||p[1]<r.rect[1]||p[0]+1>r.rect[2]||p[1]+1>r.rect[3]){e.push(name+': sus peldaños salen de los cuartos conectados.');break;}
    for(const p of d.doors.filter(p=>p.floor===f)){const[a,z,c,b]=p.rect,v=c-a===1,zone=[a-(v?1.15:.15),z-(v?.15:1.15),c+(v?1.15:.15),b+(v?.15:1.15)];if(overlap(res.rect,zone))e.push(name+': bloquea el paso de la puerta '+p.id+'. Deja libre su zona de acceso.');}
   }
  });return [...new Set(e)];
 }
 root.NDAStructure={translate,paths,errors,names};
})(globalThis);
