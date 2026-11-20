"""Validate the editable art manifest; gameplay fields are never part of it."""
import math,re,json
from pathlib import Path
KINDS={'termo','emf','grab','gases','uv','espejo','cam'}
def validate(data,current=None,kinds=KINDS,version="instrumentos-v17",max_dimension=2,max_position=2):
 if set(data['tools'])!=kinds:raise ValueError('Debe conservarse el inventario del catálogo')
 if data.get('version')!=version or data.get('units')!='meters':raise ValueError('Versión o unidades inválidas')
 count=0
 for kind,tool in data['tools'].items():
  ids=set()
  for p in tool['parts']:
   if p['id'] in ids:raise ValueError('ID repetido: '+p['id'])
   ids.add(p['id']);count+=1
   if p['shape'] not in ('box','cylinder')or p['group'] not in ('body','stand','folded'):raise ValueError('Forma o grupo inválido')
   if not re.fullmatch(r'#[0-9a-fA-F]{6}',p['color']):raise ValueError('Color hexadecimal inválido')
   for field in ('position','rotation'):
    if len(p[field])!=3 or any(type(v)not in (int,float)or not math.isfinite(v)or abs(v)>(max_position if field=='position'else math.tau*2)for v in p[field]):raise ValueError('Transformación inválida: '+p['id'])
   n=3 if p['shape']=='box'else 4
   if len(p['size'])!=n or any(type(v)not in (int,float)or not math.isfinite(v)or not .001<=v<=max_dimension for v in p['size'][:3]):raise ValueError('Dimensiones inválidas: '+p['id'])
   if n==4 and (type(p['size'][3])is not int or not 4<=p['size'][3]<=8):raise ValueError('Segmentos: usar 4 a 8')
  grip=tool['grip']
  if set(grip)!=set(('position','rotation','scale'))or not .4<=grip['scale']<=1.2:raise ValueError('Agarre inválido')
  for field in ('position','rotation'):
   if len(grip[field])!=3 or any(type(v)not in (int,float)or not math.isfinite(v)or abs(v)>(.5 if field=='position'else math.tau*2)for v in grip[field]):raise ValueError('Agarre fuera de rango')
 if current:
  def fixed(d):
   import copy
   c=copy.deepcopy(d)
   for t in c['tools'].values():
    t.pop('grip')
    for p in t['parts']:
     for k in ('position','rotation','size','color'):p.pop(k)
   return c
  if fixed(data)!=fixed(current):raise ValueError('El taller conserva IDs, piezas, funciones y grupos; edita transformaciones, medidas, colores y agarre')
 return {'passed':True,'tools':len(kinds),'parts':count}
if __name__=='__main__':print(json.dumps(validate(json.loads((Path(__file__).resolve().parents[1]/'src/tools-components.json').read_text(encoding='utf8')))))
