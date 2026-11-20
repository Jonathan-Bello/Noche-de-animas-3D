"""Local visual editor: python tools/editor_server.py, then http://127.0.0.1:8790/editor/"""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,subprocess,sys,runpy,threading
ROOT=Path(__file__).resolve().parents[1]
LOCK=threading.Lock()
validate=runpy.run_path(str(ROOT/'tools/check_furnishing.py'))['validate']
validate_tools=runpy.run_path(str(ROOT/'tools/check_tools.py'))['validate']
validate_items=runpy.run_path(str(ROOT/'tools/check_items.py'))['validate']
validate_furniture=runpy.run_path(str(ROOT/'tools/check_furniture.py'))['validate']
def validate_edit(next,current):
 allowed={'obstacles','decorInstances','hidingSockets','roomModules','audit'}
 for key,value in current.items():
  if key not in allowed and next.get(key)!=value:raise ValueError('Esta versión conserva estructura, puertas y catálogo: '+key)
 old={o['id']:o for o in current['obstacles']};new={o['id']:o for o in next['obstacles']}
 if old.keys()!=new.keys():raise ValueError('No se agregan ni eliminan muebles estructurales en esta versión')
 for id,o in new.items():
  if {k:v for k,v in o.items()if k not in ('rect','rotation','backWall','facing')}!={k:v for k,v in old[id].items()if k not in ('rect','rotation','backWall','facing')}:raise ValueError('Solo se mueve la huella del mueble '+id)
  a,b=old[id]['rect'],o['rect']
  if (id.startswith(('reserva_','columna')) or id in ['fuente','figura_central_fuente','altar_fijo']) and a!=b:raise ValueError('Pieza estructural protegida '+id)
  if len(b)!=4 or any(not isinstance(v,(int,float))or int(v)!=v for v in b)or sorted([b[2]-b[0],b[3]-b[1]])!=sorted([a[2]-a[0],a[3]-a[1]]):raise ValueError('Huella inválida '+id)
  room=next_room(current,old[id])
  if room and not(room['rect'][0]<=b[0]<b[2]<=room['rect'][2] and room['rect'][1]<=b[1]<b[3]<=room['rect'][3]):raise ValueError('Mueble fuera de su cuarto '+id)
  fd=o.get('facing',0)-old[id].get('facing',0)
  if abs(fd)>.0001 and(o.get('model')!='chair'or abs(fd/(3.141592653589793/2)-round(fd/(3.141592653589793/2)))>.0001):raise ValueError('Giro de silla inválido')
  delta=(o.get('rotation',0)-old[id].get('rotation',0))
  if abs(delta/(3.141592653589793/2)-round(delta/(3.141592653589793/2)))>.0001:raise ValueError('Giro de mueble: pasos de 90 grados')
  if abs(delta)>.0001 and(o['id']not in json.loads((ROOT/'src/furniture-components.json').read_text(encoding='utf8'))['tools']or o.get('kind')=='prop'):raise ValueError('Esta pieza conserva su orientación')
  quarter=round(delta/(3.141592653589793/2))%4
  if [b[2]-b[0],b[3]-b[1]]!=([a[3]-a[1],a[2]-a[0]]if quarter%2 else[a[2]-a[0],a[3]-a[1]]):raise ValueError('El giro no coincide con su huella')
  if old[id].get('backWall'):
   order=['north','west','south','east'];expected=order[(order.index(old[id]['backWall'])+quarter)%4]
   if o.get('backWall')!=expected:raise ValueError('Respaldo incoherente con el giro')
  elif o.get('backWall')!=old[id].get('backWall'):raise ValueError('No se cambia el respaldo')
 old_h={h['id']:h for h in current['hidingSockets']};new_h={h['id']:h for h in next['hidingSockets']}
 if old_h.keys()!=new_h.keys():raise ValueError('Se conservan los 24 escondites')
 for id,h in new_h.items():
  if {k:v for k,v in h.items()if k not in ('x','z','preferredSolid')}!={k:v for k,v in old_h[id].items()if k not in ('x','z','preferredSolid')}:raise ValueError('Solo se mueve el escondite '+id)
  if any(type(v)is not int for v in [h['x'],h['z'],*h['preferredSolid']]):raise ValueError('Escondite fuera de cuadrícula')
  before=old_h[id];dx,dz=before['x']-before['preferredSolid'][0],before['z']-before['preferredSolid'][1]
  if sorted([abs(h['x']-h['preferredSolid'][0]),abs(h['z']-h['preferredSolid'][1])])!=sorted([abs(dx),abs(dz)]):raise ValueError('Se conserva el acceso del escondite')
 next['roomModules']=current['roomModules'];next['audit']=current['audit']
 for m in next['roomModules']:m['decoration']=[i['id']for i in next['decorInstances']if i['room']==m['id']]
 return validate(next)
def next_room(layout,o):
 return next((r for r in layout['rooms']if r['floor']==o['floor']and r['rect'][0]<=(o['rect'][0]+o['rect'][2])/2<r['rect'][2]and r['rect'][1]<=(o['rect'][1]+o['rect'][3])/2<r['rect'][3]),None)
class Editor(SimpleHTTPRequestHandler):
 def log_message(self,*args):pass
 def __init__(self,*a,**kw):super().__init__(*a,directory=str(ROOT),**kw)
 def do_POST(self):
  if self.path=='/api/tools':return self.save_tools()
  if self.path=='/api/items':return self.save_tools('items')
  if self.path=='/api/furniture':return self.save_tools('furniture')
  if self.path!='/api/layout':self.send_error(404);return
  if self.headers.get('Origin')not in [None,'http://127.0.0.1:8790','http://localhost:8790']or self.headers.get_content_type()!='application/json':self.send_error(403);return
  n=int(self.headers.get('Content-Length','0'))
  if n<1 or n>2000000:self.send_error(413);return
  path=ROOT/'src/layout-v11.json';compiled=ROOT/'juego/index.html'
  with LOCK:
   original=path.read_bytes();old_game=compiled.read_bytes()
   try:
    data=json.loads(self.rfile.read(n));validate_edit(data,json.loads(original))
    (ROOT/'test-results').mkdir(exist_ok=True);(ROOT/'test-results/editor-backup.json').write_bytes(original)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    check=subprocess.run(['node','-e',"const a=require('./test/session-casona.cjs');for(let k=0;k<20;k++){const w=a.newWorld({role:'inv',nInv:4});if(w.layoutPackingMisses.length)throw Error(JSON.stringify(w.layoutPackingMisses));}"],cwd=ROOT,capture_output=True,text=True)
    if check.returncode:raise ValueError('Distribución no válida para el juego: '+check.stderr[-1500:])
    build=subprocess.run([sys.executable,'src/build.py','prod'],cwd=ROOT,capture_output=True,text=True)
    if build.returncode:raise ValueError(build.stderr)
   except Exception as e:
    path.write_bytes(original);compiled.write_bytes(old_game);self.send_response(422);self.end_headers();self.wfile.write(str(e).encode('utf8'));return
  self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'{"saved":true}')
 def save_tools(self,catalog="tools"):
  if self.headers.get('Origin')not in [None,'http://127.0.0.1:8790','http://localhost:8790']or self.headers.get_content_type()!='application/json':self.send_error(403);return
  n=int(self.headers.get('Content-Length','0'))
  if n<1 or n>2000000:self.send_error(413);return
  path=ROOT/('src/'+catalog+'-components.json');compiled=ROOT/'juego/index.html'
  with LOCK:
   original=path.read_bytes();old_game=compiled.read_bytes()
   try:
    data=json.loads(self.rfile.read(n));(validate_furniture if catalog=="furniture"else validate_items if catalog=="items"else validate_tools)(data,json.loads(original))
    (ROOT/'test-results').mkdir(exist_ok=True);(ROOT/('test-results/'+catalog+'-backup.json')).write_bytes(original)
    path.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
    build=subprocess.run([sys.executable,'src/build.py','prod'],cwd=ROOT,capture_output=True,text=True)
    if build.returncode:raise ValueError(build.stderr)
   except Exception as e:
    path.write_bytes(original);compiled.write_bytes(old_game);self.send_response(422);self.end_headers();self.wfile.write(str(e).encode('utf8'));return
  self.send_response(200);self.send_header('Content-Type','application/json');self.end_headers();self.wfile.write(b'{"saved":true}')
if __name__=='__main__':
 print('Taller: http://127.0.0.1:8790/editor/ — guarda en src/layout-v11.json; no publica en GitHub.',flush=True)
 if '--open' in sys.argv:
  import webbrowser
  threading.Timer(.8,lambda:webbrowser.open('http://127.0.0.1:8790/editor/')).start()
 ThreadingHTTPServer(('127.0.0.1',8790),Editor).serve_forever()
