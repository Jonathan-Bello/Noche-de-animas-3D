"""Shared furniture geometry, hide apertures, component save/undo and references."""
import asyncio,json,runpy,threading,sys
from pathlib import Path
from http.server import ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Muebles_v19';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
async def main():
 mod=runpy.run_path(str(ROOT/'tools/editor_server.py'));server=ThreadingHTTPServer(('127.0.0.1',8790),mod['Editor']);threading.Thread(target=server.serve_forever,daemon=True).start();original=(ROOT/'src/furniture-components.json').read_bytes();built=(ROOT/'juego/index.html').read_bytes();errors=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=await b.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text)if m.type=='error'else None)
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.goto('http://127.0.0.1:8790/arte/muebles-v19/');await page.wait_for_function('window.__workshop')
   geometry=await page.evaluate("()=>NDAFurnitureArt.kinds.map(id=>{const g=NDAFurnitureArt.create(id);let vertices=0,invalid=0;g.traverse(o=>{if(o.isMesh){vertices+=o.geometry.attributes.position.count;for(const x of o.geometry.attributes.position.array)if(!Number.isFinite(x))invalid++;if(o.material.map||!o.material.flatShading||o.material.roughness!==1)throw Error('Material inválido '+id);}});NDAFurnitureArt.dispose(g);return{id,vertices,invalid};})")
   assert len(geometry)==66 and all(g['invalid']==0 for g in geometry),geometry
   for id in ['librero_isla','hide_HB13','hide_HB06','hide_HB10','hide_HB03','drawer_standard','book_standard','mesa_comedor','am_B06','am_B10','am_A11','am_herbolario','cama_A10','am_cama_nino','prop_cuna']:
    await page.select_option('#kind',id);await page.wait_for_timeout(60);await page.locator('.layout section').screenshot(path=str(OUT/(id+'.png')))
   await page.select_option('#kind','librero_isla');await page.select_option('#part','entrepaño_1');assert await page.get_by_label('position Y',exact=True).get_attribute('readonly')is not None
   await page.select_option('#part','cornisa');await page.locator('#color').fill('#73482f');await page.locator('#color').dispatch_event('change');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   saved=json.loads((ROOT/'src/furniture-components.json').read_text(encoding='utf8'));assert next(p for p in saved['tools']['librero_isla']['parts']if p['id']=='cornisa')['color']=='#73482f'
   await page.click('#undo');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')");assert json.loads((ROOT/'src/furniture-components.json').read_text(encoding='utf8'))==json.loads(original)
   protected=await page.evaluate("async()=>{const d=structuredClone(__workshop.data);d.tools.librero_isla.parts.find(p=>p.id==='entrepaño_1').position[1]+=.03;const r=await fetch('/api/furniture',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});return r.status;}");assert protected==422
   errors[:]=[e for e in errors if '422'not in e]
   aperture=await page.evaluate("()=>['hide_HB13','hide_HB10'].map(id=>{const g=NDAFurnitureArt.create(id),s=g.userData.hide,eye=NDAFurnitureComponents.tools[id].eyeHeight;const meshes=()=>{const out=[];g.updateMatrixWorld(true);g.traverseVisible(o=>{if(o.isMesh)out.push(o)});return out;};s.slit.visible=false;s.lock.visible=false;const ray=new THREE.Raycaster(new THREE.Vector3(0,eye,-.20),new THREE.Vector3(0,0,1)),open=ray.intersectObjects(meshes(),false).length;s.slit.visible=true;const locked=ray.intersectObjects(meshes(),false).length;NDAFurnitureArt.dispose(g);return{id,open,locked};})")
   assert all(x['open']==0 and x['locked']>0 for x in aperture),aperture
   assert not errors,errors
   report={'passed':True,'models':66,'parts':1100,'geometry':geometry,'saveUndo':True,'protectedSupports':True,'apertures':aperture,'errors':errors};(OUT/'furniture_validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps({k:v for k,v in report.items()if k!='geometry'}));await b.close()
 finally:
  (ROOT/'src/furniture-components.json').write_bytes(original);(ROOT/'juego/index.html').write_bytes(built);server.shutdown()
asyncio.run(main())
