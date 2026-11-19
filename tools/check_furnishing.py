"""Architectural reservations, support and window checks before building a scene."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def overlaps(a,b):return a[0]<b[2]-.001 and a[2]>b[0]+.001 and a[1]<b[3]-.001 and a[3]>b[1]+.001
def validate(d):
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
 for o in d['obstacles']:
  if o.get('model')!='bed' and not o['id'].startswith('cama_'):continue
  room=next(r for r in d['rooms'] if r['floor']==o['floor'] and r['rect'][0]<=o['rect'][0]<r['rect'][2] and r['rect'][1]<=o['rect'][1]<r['rect'][3]);wall=o.get('backWall');axis={'west':(0,0),'east':(2,2),'north':(1,1),'south':(3,3)}.get(wall)
  if not axis or abs(o['rect'][axis[0]]-room['rect'][axis[1]])>.01:errors.append(o['id']+' tiene cabecera sin muro')
 for w in d['windows']:
  if w.get('internal') and (w['state']!='abierta' or w.get('grille')):errors.append(w['id']+' tapa ventana interna')
 for rug in d.get('decorations',[]):
  for door,f,r in zones:
   if rug['floor']==f and overlaps(rug['rect'],r):errors.append(rug['id']+' invade acceso '+door)
 if errors:raise ValueError('\n'.join(errors))
 return {'doors':len(zones),'furnitureAndHides':len(objects),'bedsAgainstWalls':sum(o.get('model')=='bed' or o['id'].startswith('cama_')for o in d['obstacles']),'internalWindowsOpen':sum(w.get('internal',False)for w in d['windows']),'rugs':len(d.get('decorations',[])),'errors':errors}
if __name__=='__main__':print(json.dumps(validate(json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf-8'))),ensure_ascii=False))
