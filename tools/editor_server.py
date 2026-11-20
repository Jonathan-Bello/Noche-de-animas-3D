"""Local visual editor: python tools/editor_server.py, then http://127.0.0.1:8790/editor/"""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
import json,subprocess,sys,runpy,threading,re
ROOT=Path(__file__).resolve().parents[1]
LOCK=threading.Lock()
validate=runpy.run_path(str(ROOT/'tools/check_furnishing.py'))['validate']
validate_tools=runpy.run_path(str(ROOT/'tools/check_tools.py'))['validate']
validate_items=runpy.run_path(str(ROOT/'tools/check_items.py'))['validate']
validate_furniture=runpy.run_path(str(ROOT/'tools/check_furniture.py'))['validate']
structure=runpy.run_path(str(ROOT/'tools/check_structure.py'))

def validate_edit(next,current):
 if next.keys()!=current.keys():raise ValueError('El plano debe conservar todos los campos del formato original.')
 allowed={'obstacles','decorInstances','hidingSockets','roomModules','audit','stairs'}
 for key,value in current.items():
  if key not in allowed and next.get(key)!=value:raise ValueError('Esta versión conserva estructura, puertas y catálogo: '+key)
 structure['validate_stair_edit'](next,current)
 old={(o['floor'],o['id']):o for o in current['obstacles']};new={(o['floor'],o['id']):o for o in next['obstacles']}
 if len(new)!=len(next['obstacles']):raise ValueError('Cada mueble debe tener un identificador único por piso.')
 for key,o in old.items():
  if key not in new and not o.get('editorSource'):raise ValueError('Conserva los muebles originales; puedes quitar las copias añadidas.')
 if sum(bool(o.get('editorSource'))for o in new.values())>64:raise ValueError('Límite: 64 muebles añadidos para mantener el rendimiento.')
 if sum(o.get('model')=='bookcase'and bool(o.get('editorSource'))for o in new.values())>4:raise ValueError('Límite: cuatro libreros adicionales con libros arrojables.')
 for key,o in new.items():
  id=o['id']
  if id.startswith('reserva_'):continue
  if key not in old:
   validate_added_furniture(o,current)
   continue
  if {k:v for k,v in o.items()if k not in ('rect','rotation','backWall','facing')}!={k:v for k,v in old[key].items()if k not in ('rect','rotation','backWall','facing')}:raise ValueError('Solo se mueve la huella del mueble '+id)
  a,b=old[key]['rect'],o['rect']
  if len(b)!=4 or any(not isinstance(v,(int,float))or int(v)!=v for v in b)or sorted([b[2]-b[0],b[3]-b[1]])!=sorted([a[2]-a[0],a[3]-a[1]]):raise ValueError('Huella inválida '+id)
  room=next_room(current,old[key])
  if not room and id.startswith('columna'):room={'rect':current['ringOuter']}
  if not room and id in ['fuente','figura_central_fuente']:room={'rect':current['patio']}
  if room and not(room['rect'][0]<=b[0]<b[2]<=room['rect'][2] and room['rect'][1]<=b[1]<b[3]<=room['rect'][3]):raise ValueError('Mueble fuera de su cuarto '+id)
  fd=o.get('facing',0)-old[key].get('facing',0)
  if abs(fd)>.0001 and(o.get('model')!='chair'or abs(fd/(3.141592653589793/2)-round(fd/(3.141592653589793/2)))>.0001):raise ValueError('Giro de silla inválido')
  delta=(o.get('rotation',0)-old[key].get('rotation',0))
  if abs(delta/(3.141592653589793/2)-round(delta/(3.141592653589793/2)))>.0001:raise ValueError('Giro de mueble: pasos de 90 grados')
  if abs(delta)>.0001 and(o.get('modelRef',o['id'])not in json.loads((ROOT/'src/furniture-components.json').read_text(encoding='utf8'))['tools']or o.get('kind')=='prop'):raise ValueError('Esta pieza conserva su orientación')
  quarter=round(delta/(3.141592653589793/2))%4
  if [b[2]-b[0],b[3]-b[1]]!=([a[3]-a[1],a[2]-a[0]]if quarter%2 else[a[2]-a[0],a[3]-a[1]]):raise ValueError('El giro no coincide con su huella')
  if old[key].get('backWall'):
   order=['north','west','south','east'];expected=order[(order.index(old[key]['backWall'])+quarter)%4]
   if o.get('backWall')!=expected:raise ValueError('Respaldo incoherente con el giro')
  elif o.get('backWall')!=old[key].get('backWall'):raise ValueError('No se cambia el respaldo')
 old_h={h['id']:h for h in current['hidingSockets']};new_h={h['id']:h for h in next['hidingSockets']}
 if len(new_h)!=len(next['hidingSockets']):raise ValueError('Cada escondite debe tener un identificador único.')
 for id,h in old_h.items():
  if id not in new_h and not h.get('editorSource'):raise ValueError('Conserva los escondites originales; puedes quitar los añadidos.')
 if sum(bool(h.get('editorSource'))for h in new_h.values())>24:raise ValueError('Límite: 24 escondites adicionales.')
 for id,h in new_h.items():
  if id not in old_h:
   validate_added_hide(h,current)
   continue
  if {k:v for k,v in h.items()if k not in ('x','z','preferredSolid')}!={k:v for k,v in old_h[id].items()if k not in ('x','z','preferredSolid')}:raise ValueError('Solo se mueve el escondite '+id)
  if any(type(v)is not int for v in [h['x'],h['z'],*h['preferredSolid']]):raise ValueError('Escondite fuera de cuadrícula')
  before=old_h[id];dx,dz=before['x']-before['preferredSolid'][0],before['z']-before['preferredSolid'][1]
  if sorted([abs(h['x']-h['preferredSolid'][0]),abs(h['z']-h['preferredSolid'][1])])!=sorted([abs(dx),abs(dz)]):raise ValueError('Se conserva el acceso del escondite')
 next['roomModules']=current['roomModules'];next['audit']=current['audit']
 for m in next['roomModules']:m['decoration']=[i['id']for i in next['decorInstances']if i['room']==m['id']]
 return validate(next)
def validate_added_furniture(o,current):
 source=next((s for s in current['obstacles']if s['id']==o.get('editorSource')and not s.get('editorSource')),None)
 if not source or not source.get('model')or source.get('kind')=='prop'or not re.fullmatch(r'user_f_[a-f0-9]{32}',o['id']):raise ValueError('Solo se añaden copias de muebles del catálogo, con su propio identificador.')
 mutable={'id','floor','room','rect','rotation','backWall','facing','modelRef','editorSource'}
 if {k:v for k,v in o.items()if k not in mutable}!={k:v for k,v in source.items()if k not in mutable}:raise ValueError('La copia debe conservar el modelo, las funciones y los apoyos de su mueble original.')
 if o.get('modelRef')!=source.get('modelRef',source['id']):raise ValueError('La copia debe usar el componente visual del mueble original.')
 room=next((r for r in current['rooms']if r['id']==o.get('room')and r['floor']==o['floor']),None)
 if not room:raise ValueError('Elige un cuarto válido para añadir el mueble.')
 b=o['rect'];a=source['rect'];delta=(o.get('rotation',0)-source.get('rotation',0))/(3.141592653589793/2)
 if not isinstance(delta,(int,float))or abs(delta-round(delta))>.0001:raise ValueError('Gira el mueble en pasos de 90 grados.')
 if len(b)!=4 or any(type(v)not in [int,float]or v!=int(v)for v in b):raise ValueError('La copia debe colocarse en casillas de un metro.')
 wanted=[a[2]-a[0],a[3]-a[1]];wanted=wanted[::-1]if round(delta)%2 else wanted
 if [b[2]-b[0],b[3]-b[1]]!=wanted:raise ValueError('La copia conserva el tamaño original del mueble.')
 if not(room['rect'][0]<=b[0]<b[2]<=room['rect'][2]and room['rect'][1]<=b[1]<b[3]<=room['rect'][3]):raise ValueError('La copia sale de los límites de su cuarto.')
 if source.get('backWall'):
  order=['north','west','south','east']
  if o.get('backWall')!=order[(order.index(source['backWall'])+round(delta))%4]:raise ValueError('El respaldo de la copia no coincide con su giro.')
 facing=(o.get('facing',0)-source.get('facing',0))/(3.141592653589793/2)
 if (source.get('model')!='chair'and abs(facing)>.0001)or abs(facing-round(facing))>.0001:raise ValueError('La orientación de la copia no es válida.')

def validate_added_hide(h,current):
 source=next((s for s in current['hidingSockets']if s['id']==h.get('editorSource')and not s.get('editorSource')),None)
 if not source or not re.fullmatch(r'user_h_[a-f0-9]{32}',h['id']):raise ValueError('Elige un escondite del catálogo para añadir una copia.')
 mutable={'id','room','floor','x','z','preferredSolid','mandatory','modelRef','editorSource'}
 if {k:v for k,v in h.items()if k not in mutable}!={k:v for k,v in source.items()if k not in mutable}or h.get('modelRef')!='hide_'+source['id']or h.get('mandatory')is not False:raise ValueError('El escondite añadido conserva su modelo y es un candidato de la selección de la partida.')
 if any(type(v)is not int for v in [h['x'],h['z'],*h['preferredSolid']]):raise ValueError('Coloca el escondite en casillas completas.')
 dx,dz=source['x']-source['preferredSolid'][0],source['z']-source['preferredSolid'][1]
 if sorted([abs(h['x']-h['preferredSolid'][0]),abs(h['z']-h['preferredSolid'][1])])!=sorted([abs(dx),abs(dz)]):raise ValueError('La entrada del escondite debe permanecer junto a su volumen.')

def runtime_message(text):
 if 'Hide coverage failed' in text or 'No legal hide selection' in text or 'Hide budget exceeded' in text:return 'La nueva distribución deja zonas sin un escondite alcanzable. Acerca un escondite o devuelve la escalera a una posición con acceso libre.'
 if 'Authored hide obstructed' in text:return 'Un mueble o una escalera tapa el acceso de un escondite. Deja libre su entrada.'
 if 'no hay una ruta transitable' in text:return 'No se puede recorrer la casa completa con esta distribución. Deja libres las entradas y desembarcos de las escaleras en ambos pisos.'
 if 'layoutPackingMisses' in text or 'superficies' in text:return 'No caben los objetos de la partida en las superficies disponibles. Deja espacio libre en mesas y repisas.'
 return 'No se pudo validar la navegación del plano. Revisa las rutas y los accesos, o deshaz el último cambio.'

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
    if check.returncode:raise ValueError(runtime_message(check.stderr))
    nav=subprocess.run(['node','test/editor-navigation.cjs'],cwd=ROOT,capture_output=True,text=True)
    if nav.returncode:raise ValueError(runtime_message(nav.stderr))
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
