"""Validate a data-only public editor request before changing the source or deployed game."""
import json,subprocess,sys,runpy,os,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]

def run(args):
 p=subprocess.run(args,cwd=ROOT,capture_output=True,text=True,encoding='utf8')
 if p.returncode:raise ValueError(p.stderr[-3000:]or p.stdout[-3000:])
 return p.stdout.strip()

def process():
 request=json.loads((ROOT/'editor-publications/request.json').read_text(encoding='utf8'))
 status_path=ROOT/'editor-publications/status.json'
 status=json.loads(status_path.read_text(encoding='utf8'))
 if not request.get('id')or request['id']==status.get('id'):return False
 original=(ROOT/'src/layout-v11.json').read_bytes();game=(ROOT/'juego/index.html').read_bytes()
 status={'id':request['id'],'runId':os.environ.get('GITHUB_RUN_ID','local'),'state':'rejected','message':''}
 try:
  if len(json.dumps(request))>1900000 or request.get('version')!=1:raise ValueError('El archivo del plano es incompatible o demasiado grande.')
  if run(['git','hash-object','src/layout-v11.json'])!=request['baseSHA']:raise ValueError('El plano publicado cambió desde que abriste el editor. Carga el plano publicado y vuelve a aplicar tu cambio.')
  candidate=request['layout'];current=json.loads(original)
  runpy.run_path(str(ROOT/'tools/editor_server.py'))['validate_edit'](candidate,current)
  (ROOT/'src/layout-v11.json').write_text(json.dumps(candidate,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
  try:run(['node','test/editor-navigation.cjs'])
  except ValueError as e:raise ValueError(runpy.run_path(str(ROOT/'tools/editor_server.py'))['runtime_message'](str(e)))
  run([sys.executable,'src/build.py','prod'])
  status.update(state='validated',message='Plano validado: guardado en el repositorio y preparando despliegue.')
 except Exception as e:
  (ROOT/'src/layout-v11.json').write_bytes(original);(ROOT/'juego/index.html').write_bytes(game)
  status['message']=str(e)[:5000]
 status_path.write_text(json.dumps(status,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 print(status['state']+': '+status['message'])
 return True

if __name__=='__main__':
 process()
 # Include only public assets, never .git, workflow credentials, scripts or QA dependencies.
 target=ROOT/'_site'
 if target.resolve().parent!=ROOT.resolve():raise ValueError('Carpeta de publicación fuera del proyecto.')
 if target.exists():shutil.rmtree(target)
 target.mkdir()
 for name in ['index.html','editor','src','juego','arte','docs','prueba-voz']:
  p=ROOT/name
  if p.is_dir():shutil.copytree(p,target/name,ignore=shutil.ignore_patterns('__pycache__','*.py','*.pyc'))
  elif p.exists():shutil.copy2(p,target/name)
 (target/'.nojekyll').touch()
