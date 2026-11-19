"""Derived per-room packages; edit the registry/editor, never these generated JSON files."""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def export(layout):
 out=ROOT/'arte/modulos-casona';out.mkdir(exist_ok=True)
 for r in layout['rooms']:
  ox,oz,c,e=r['rect'];module=next(m for m in layout['roomModules']if m['id']==r['id']);obs=[o for o in layout['obstacles']if o['floor']==r['floor'] and ox<=(o['rect'][0]+o['rect'][2])/2<c and oz<=(o['rect'][1]+o['rect'][3])/2<e];local=[]
  for o in obs:
   item=dict(o);item['rect']=[v-(ox if k%2==0 else oz)for k,v in enumerate(o['rect'])];local.append(item)
  package=dict(id=r['id'],name=r['name'],origin=[ox,r['floor']*3.8,oz],size=[c-ox,3.8,e-oz],campaign={k:v for k,v in module.items()if k in ['initial','purchasable','autoWith','complement','favorite']},furniture=local,decorSupports=[s for s in layout.get('decorSupports',[])if s['room']==r['id']],decorations=[i for i in layout.get('decorInstances',[])if i['room']==r['id']],hidingSockets=[h for h in layout['hidingSockets']if h['room']==r['id']],doors=[door for door in layout['doors']if r['id']in[door['a'],door['b']]],note='Furniture rects local to origin; door/socket positions remain shared world coordinates. Runtime campaign gating is not implemented.')
  (out/(r['id']+'.json')).write_text(json.dumps(package,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 return len(layout['rooms'])
if __name__=='__main__':print('Exported',export(json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'))),'room modules')
