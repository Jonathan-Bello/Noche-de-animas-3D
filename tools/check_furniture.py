import json,runpy,math
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
base=runpy.run_path(str(ROOT/'tools/check_tools.py'))['validate']
def validate(data,current=None):
 kinds=set(data['tools'])
 if len(kinds)!=66:raise ValueError('Se conservan los 66 componentes de mobiliario')
 # The shared numeric validator is also used by all existing workshops.
 result=base(data,current,kinds=kinds,version='muebles-v19',max_dimension=8,max_position=5)
 for id,o in data['tools'].items():
  margin=.09 if o['category']=='hide'else .025
  for p in o['parts']:
   if current and p.get('role')=='support':
    old=next(x for x in current['tools'][id]['parts']if x['id']==p['id'])
    if any(p[k]!=old[k]for k in ('position','size','rotation')):raise ValueError(id+': conserva las medidas y altura del apoyo '+p['id'])
   # Check actual rotated box corners; edited trim cannot invade the next tile.
   x,y,z=p['rotation'];cx,sx,cy,sy,cz,sz=math.cos(x),math.sin(x),math.cos(y),math.sin(y),math.cos(z),math.sin(z)
   for a in [-1,1]:
    for b in [-1,1]:
     for c in [-1,1]:
      xx,yy,zz=a*p['size'][0]/2,b*p['size'][1]/2,c*p['size'][2]/2
      qx,qy=cz*xx-sz*yy,sz*xx+cz*yy;rx,rz=cy*qx+sy*zz,-sy*qx+cy*zz
      X=rx+p['position'][0];Z=sx*qy+cx*rz+p['position'][2]
      if abs(X)>o['footprint'][0]/2+margin or abs(Z)>o['footprint'][1]/2+margin:raise ValueError(id+': la pieza sale de la huella '+p['id'])
 return result
if __name__=='__main__':print(json.dumps(validate(json.loads((ROOT/'src/furniture-components.json').read_text(encoding='utf8')))))
