"""Validate stair translations as an indivisible two-floor structural component."""
import copy,math

DEFAULTS=[[[[11,26],[10,26],[9,26],[8,26],[7,26],[7,25]],[[7,25],[7,24],[8,24],[9,24],[10,24],[11,24]]],[[[38,2],[39,2],[40,2],[41,2]],[[41,2],[42,2],[43,2],[44,2],[45,2]]]]

def translated(stair,k,dx,dz):
 s=copy.deepcopy(stair)
 s['navPaths']=[[[x+dx,z+dz]for x,z in p]for p in s.get('navPaths',DEFAULTS[k])]
 for key in ['hole','clearance']:
  if key in s:s[key]=[v+(dz if i%2 else dx)for i,v in enumerate(s[key])]
 for key in ['lowerAnchor','upperAnchor']:s[key]=[s[key][0]+dx,s[key][1]+dz]
 s['path']=[[x+dx,z+dz,h]for x,z,h in s['path']]
 if 'landingRails'in s:s['landingRails']=[[a+dx,b+dz,c+dx,e+dz,h]for a,b,c,e,h in s['landingRails']]
 return s

def equal(a,b):
 if isinstance(a,(float,int))and isinstance(b,(float,int)):return math.isfinite(a)and math.isfinite(b)and abs(a-b)<1e-7
 if isinstance(a,dict)and isinstance(b,dict):return a.keys()==b.keys()and all(equal(a[k],b[k])for k in a)
 if isinstance(a,list)and isinstance(b,list):return len(a)==len(b)and all(equal(x,y)for x,y in zip(a,b))
 return a==b

def validate_stair_edit(candidate,current):
 if len(candidate['stairs'])!=len(current['stairs']):raise ValueError('No se agregan ni eliminan escaleras: conserva las dos conexiones entre pisos.')
 for k,(before,s)in enumerate(zip(current['stairs'],candidate['stairs'])):
  if s.get('id')!=before['id']:raise ValueError('Se conserva la identidad y el orden de las escaleras.')
  dx=s['hole'][0]-before['hole'][0];dz=s['hole'][1]-before['hole'][1]
  if not all(isinstance(v,(int,float))and math.isfinite(v)and v==int(v)for v in [dx,dz]):raise ValueError('Mueve la escalera en casillas completas de 1 metro.')
  expected=translated(before,k,dx,dz)
  # Old registries need not store redundant navigation paths until a stair is moved.
  if 'navPaths'not in s and equal(expected['navPaths'],DEFAULTS[k]):expected.pop('navPaths',None)
  if not equal(s,expected):raise ValueError('La escalera debe moverse completa: peldaños, hueco, barandales, accesos y ruta. No se permite girarla o cambiar su tamaño todavía.')
  for f,rid in [[0,s['lower']],[1,s['upper']]]:
   old=next(o for o in current['obstacles']if o['floor']==f and o['id']=='reserva_escalera_'+s['id'])
   actual=next(o for o in candidate['obstacles']if o['floor']==f and o['id']==old['id'])
   want={**old,'rect':[v+(dz if i%2 else dx)for i,v in enumerate(old['rect'])]}
   if not equal(want,actual):raise ValueError('La reserva de paso de la escalera debe moverse en ambos pisos.')

def validate_structure(d):
 for k,s in enumerate(d['stairs']):
  for f,rid in [[0,s['lower']],[1,s['upper']]]:
   room=next(r for r in d['rooms']if r['id']==rid)
   reserve=next(o for o in d['obstacles']if o['floor']==f and o['id']=='reserva_escalera_'+s['id'])
   a,z,c,e=reserve['rect'];ra,rz,rc,re=room['rect']
   if not(ra<=a<c<=rc and rz<=z<e<=re):raise ValueError('La escalera '+s['id']+' sale de '+room['name']+'. Debe caber en sus dos cuartos conectados.')
   for x,z in s.get('navPaths',DEFAULTS[k])[f]:
    if not(ra<=x<x+1<=rc and rz<=z<z+1<=re):raise ValueError('Los peldaños salen del cuarto '+room['name']+'.')
 return True
