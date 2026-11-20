"""The same validation/build entry point used by GitHub Actions, with all source bytes restored."""
import json,runpy,subprocess,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Editor_v20';OUT.mkdir(exist_ok=True)
paths=[ROOT/p for p in ['src/layout-v11.json','juego/index.html','editor-publications/request.json','editor-publications/status.json']]+list((ROOT/'arte/modulos-casona').glob('*.json'))
before={p:p.read_bytes()for p in paths};current=json.loads(before[ROOT/'src/layout-v11.json']);translate=runpy.run_path(str(ROOT/'tools/check_structure.py'))['translated'];process=runpy.run_path(str(ROOT/'tools/publish_editor.py'))['process']
def shifted(dx,dz):
 d=copy.deepcopy(current);d['stairs'][0]=translate(d['stairs'][0],0,dx,dz)
 for o in d['obstacles']:
  if o['id']=='reserva_escalera_principal':o['rect']=[v+(dz if i%2 else dx)for i,v in enumerate(o['rect'])]
 return d
def request(id,layout,sha=None):
 (ROOT/'editor-publications/request.json').write_text(json.dumps({'version':1,'id':id,'baseSHA':sha or subprocess.check_output(['git','hash-object','src/layout-v11.json'],cwd=ROOT,text=True).strip(),'layout':layout},ensure_ascii=False),encoding='utf8')
 process();return json.loads((ROOT/'editor-publications/status.json').read_text(encoding='utf8'))
try:
 accepted=request('valid',shifted(-1,0));assert accepted['state']=='validated',accepted
 assert json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'))['stairs'][0]['hole'][0]==5.8
 for p in [ROOT/'src/layout-v11.json',ROOT/'juego/index.html']:p.write_bytes(before[p])
 rejected=request('disconnected',shifted(0,1));assert rejected['state']=='rejected',rejected
 assert 'escondite'in rejected['message']or 'ruta'in rejected['message'],rejected
 assert (ROOT/'src/layout-v11.json').read_bytes()==before[ROOT/'src/layout-v11.json']
 assert (ROOT/'juego/index.html').read_bytes()==before[ROOT/'juego/index.html']
 stale=request('stale',current,'obsolete-sha');assert stale['state']=='rejected'and 'cambió'in stale['message']
 bad=shifted(-1,0);bad['stairs'][0]['path'][0][0]+=1;malformed=request('malformed',bad);assert malformed['state']=='rejected'and 'completa'in malformed['message']
 report={'passed':True,'validatedStairBuild':True,'brokenRoutesKeepPreviousGame':True,'staleBaseRejected':True,'partialStructuralMoveRejected':True,'spanishNavigationError':rejected['message']}
 (OUT/'publicacion-verificacion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False))
finally:
 for p,data in before.items():p.write_bytes(data)
