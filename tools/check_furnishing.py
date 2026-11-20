"""Architectural reservations, support and window checks before building a scene."""
import json,math,runpy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def overlaps(a,b):return a[0]<b[2]-.001 and a[2]>b[0]+.001 and a[1]<b[3]-.001 and a[3]>b[1]+.001
def validate(d):
 runpy.run_path(str(ROOT/'tools/check_structure.py'))['validate_structure'](d)
 errors=[];zones=[];rooms={r['id']:r for r in d['rooms']}
 for p in d['doors']:
  a,z,c,e=p['rect'];v=c-a==1;zones.append((p['id'],p['floor'],[a-(1.15 if v else .15),z-(.15 if v else 1.15),c+(1.15 if v else .15),e+(.15 if v else 1.15)]))
 objects=[o for o in d['obstacles'] if not o['id'].startswith('reserva_')]+[dict(id=h['id'],floor=h['floor'],rect=[*h['preferredSolid'],h['preferredSolid'][0]+1,h['preferredSolid'][1]+1])for h in d['hidingSockets']]
 for o in objects:
  for door,f,r in zones:
   if o['floor']==f and overlaps(o['rect'],r):errors.append(o['id']+' invade acceso '+door)
 for o in objects:
  for r in d['obstacles']:
   if r['id'].startswith('reserva_') and r['floor']==o['floor'] and overlaps(o['rect'],r['rect']):errors.append(o['id']+' invade reserva '+r['id'])
 for i,o in enumerate(objects):
  for b in objects[i+1:]:
   if o['floor']==b['floor'] and overlaps(o['rect'],b['rect']) and {o['id'],b['id']}!={'fuente','figura_central_fuente'}:errors.append(o['id']+' se encima con '+b['id'])
  for stair in d['stairs']:
   if overlaps(o['rect'],stair.get('clearance',stair['hole'])):errors.append(o['id']+' invade escalera '+stair['id'])
 for h in d['hidingSockets']:
  room=rooms.get(h['room']);x,z=h['preferredSolid']
  if not room or not(room['rect'][0]<=x<x+1<=room['rect'][2]and room['rect'][1]<=z<z+1<=room['rect'][3]and room['rect'][0]<=h['x']<room['rect'][2]and room['rect'][1]<=h['z']<room['rect'][3]):errors.append(h['id']+' sale de su cuarto')
  entry=[h['x']+.12,h['z']+.12,h['x']+.88,h['z']+.88]
  for o in objects:
   if o['floor']==h['floor']and overlaps(entry,o['rect']):errors.append(h['id']+' tiene el acceso bloqueado por '+o['id'])
 for o in d['obstacles']:
  if o.get('model')!='bed' and not o['id'].startswith('cama_'):continue
  room=next(r for r in d['rooms'] if r['floor']==o['floor'] and r['rect'][0]<=o['rect'][0]<r['rect'][2] and r['rect'][1]<=o['rect'][1]<r['rect'][3]);wall=o.get('backWall');axis={'west':(0,0),'east':(2,2),'north':(1,1),'south':(3,3)}.get(wall)
  if not axis or abs(o['rect'][axis[0]]-room['rect'][axis[1]])>.01:errors.append(o['id']+' tiene cabecera sin muro')
 for w in d['windows']:
  if w.get('internal') and (w['state']!='abierta' or w.get('grille')):errors.append(w['id']+' tapa ventana interna')
 for rug in d.get('decorations',[]):
  for door,f,r in zones:
   if rug['floor']==f and overlaps(rug['rect'],r):errors.append(rug['id']+' invade acceso '+door)
 ids=set();throwables=0;decor_boxes=[]
 for i in d.get('decorInstances',[]):
  if i['id'] in ids:errors.append('ID duplicado '+i['id'])
  ids.add(i['id']);a=d['decorAssets'].get(i['asset']);o=next((o for o in d['obstacles']+d.get('decorSupports',[]) if o['id']==i['support']),None)
  if not a or not o:errors.append('Componente sin modelo o soporte '+i['id']);continue
  x=o['rect'][0]+i['offset'][0];z=o['rect'][1]+i['offset'][2];h=o['height']+i['offset'][1];r=a['radius'];angle=i.get('rotation',0);co=abs(math.cos(angle));si=abs(math.sin(angle));w=a.get('width',2*r);dep=a.get('depth',2*r);rx=(w*co+dep*si)/2;rz=(w*si+dep*co)/2;foot=[x-rx,z-rz,x+rx,z+rz];throwables+=bool(a['throwable'])
  if h<-.001 or h+a['height']>3.70 or foot[0]<o['rect'][0]-.001 or foot[2]>o['rect'][2]+.001 or foot[1]<o['rect'][1]-.001 or foot[3]>o['rect'][3]+.001:errors.append(i['id']+' fuera del soporte')
  if a['height']>.06:decor_boxes.append((i['id'],o['floor'],h,h+a['height'],[foot[0]+.01,foot[1]+.01,foot[2]-.01,foot[3]-.01]))
  room=rooms.get(i['room'])
  if not room or room['floor']!=o['floor'] or not(room['rect'][0]<=x<=room['rect'][2] and room['rect'][1]<=z<=room['rect'][3]):errors.append(i['id']+' fuera de su cuarto')
  if o.get('wallOnly') and a.get('mount')!='wall':errors.append(i['id']+' requiere un soporte físico')
  if a.get('mount')=='wall' and room:
   side=i.get('mountWall');
   if side not in o.get('allowedWalls',['west','east','north','south']):errors.append(i['id']+' no tiene muro en ese lado')
   rotation={'west':math.pi/2,'east':-math.pi/2,'north':0,'south':math.pi}.get(side)
   if rotation is None or abs(math.sin(angle-rotation))>.001 or math.cos(angle-rotation)<.99:errors.append(i['id']+' orientación mural inválida')
   expected={'west':(x,room['rect'][0]+dep/2),'east':(x,room['rect'][2]-dep/2),'north':(z,room['rect'][1]+dep/2),'south':(z,room['rect'][3]-dep/2)}.get(side)
   if not expected or abs(expected[0]-expected[1])>.002:errors.append(i['id']+' separado de su muro')
  for win in d['windows']:
   globalH=o['floor']*3.8+h;bottom=win['floor']*3.8+win['sillRelative']
   if globalH+a['height']<=bottom+.001 or globalH>=bottom+win['height']-.001:continue
   a0,z0=win['start'];c0,e0=win['end'];window=[a0,z0,c0,z0+1]if a0!=c0 else[a0-1 if win['wall'].startswith('oeste')else a0,z0,a0 if win['wall'].startswith('oeste')else a0+1,e0]
   if overlaps(foot,[window[0]-.18,window[1]-.18,window[2]+.18,window[3]+.18]):errors.append(i['id']+' tapa ventana '+win['id'])
  for door,f,rect in zones:
   if f==o['floor'] and overlaps(foot,rect):errors.append(i['id']+' invade acceso '+door)
  for stair in d['obstacles']:
   if stair['id'].startswith('reserva_') and stair['floor']==o['floor'] and overlaps(foot,stair['rect']):errors.append(i['id']+' invade escalera')
 for n,(id,f,lo,hi,foot)in enumerate(decor_boxes):
  for bid,bf,blo,bhi,bfoot in decor_boxes[n+1:]:
   if f==bf and min(hi,bhi)-max(lo,blo)>.035 and overlaps(foot,bfoot):errors.append(id+' se encima con '+bid)
 if throwables>48:errors.append('Más de 48 decoraciones arrojables nuevas')
 if errors:raise ValueError('\n'.join(errors))
 return {'doors':len(zones),'furnitureAndHides':len(objects),'bedsAgainstWalls':sum(o.get('model')=='bed' or o['id'].startswith('cama_')for o in d['obstacles']),'internalWindowsOpen':sum(w.get('internal',False)for w in d['windows']),'rugs':len(d.get('decorations',[])),'decorComponents':len(ids),'throwableComponents':throwables,'errors':errors}
if __name__=='__main__':print(json.dumps(validate(json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf-8'))),ensure_ascii=False))
