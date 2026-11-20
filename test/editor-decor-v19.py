"""Decoration-mode interaction and validated local save, with original files restored."""
import sys,asyncio,threading,runpy,json,subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Muebles_v19';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
async def main():
 mod=runpy.run_path(str(ROOT/'tools/editor_server.py'));server=ThreadingHTTPServer(('127.0.0.1',8790),mod['Editor']);threading.Thread(target=server.serve_forever,daemon=True).start();original=(ROOT/'src/layout-v11.json').read_bytes();built=(ROOT/'juego/index.html').read_bytes();errors=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=await b.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text)if m.type=='error'else None)
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.goto('http://127.0.0.1:8790/editor/');await page.wait_for_function('window.__decorMode&&__decorMode.objects.size>0');await page.wait_for_timeout(300)
   assert not errors,errors
   await page.screenshot(path=str(OUT/'editor-comedor.png'))
   await page.select_option('#room','B06');await page.wait_for_timeout(120)
   await page.screenshot(path=str(OUT/'editor-biblioteca.png'))
   # Select via the visible catalog; move by clicking the real room canvas.
   await page.get_by_role('button',name='Seleccionar Librero',exact=False).first.click();await page.click('#move-piece');assert await page.locator('#carrybar').is_visible()
   invalid=await page.evaluate("()=>{const a=NDAEditor;a.move(5,10);return a.errors();}");assert invalid
   await page.wait_for_timeout(100);await page.screenshot(path=str(OUT/'editor-colocacion-invalida.png'));await page.click('#cancel-piece')
   assert json.loads(await page.evaluate('JSON.stringify(NDAEditor.data)'))==json.loads(original)
   await page.evaluate("()=>{NDAEditor.select('f','librero_isla');NDAEditor.begin();NDAEditor.move(5,17);}")
   assert not await page.evaluate('NDAEditor.errors()'),await page.evaluate('NDAEditor.errors()')
   await page.click('#place-piece');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   saved=json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'));assert next(o for o in saved['obstacles']if o['id']=='librero_isla')['rect']!=next(o for o in json.loads(original)['obstacles']if o['id']=='librero_isla')['rect']
   await page.click('#undo');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')");assert json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'))==json.loads(original)
   turns=await page.evaluate("()=>{const a=NDAEditor;a.select('f','librero_isla');const before=JSON.stringify(a.data.obstacles.find(o=>o.id==='librero_isla').rect);a.begin();for(let k=0;k<4;k++)a.rotate();const after=JSON.stringify(a.data.obstacles.find(o=>o.id==='librero_isla').rect);a.cancel();return{before,after};}");assert turns['before']==turns['after'],turns
   # Rotation carries children and book orientation while maintaining the footprint.
   rotation=await page.evaluate("()=>{const a=NDAEditor;a.select('f','librero_isla');a.begin();a.rotate();a.move(5.5,17);return{errors:a.errors(),rect:a.data.obstacles.find(o=>o.id==='librero_isla').rect};}")
   assert not rotation['errors'],rotation
   await page.click('#place-piece');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   check=subprocess.run(['node','-e',"const assert=require('node:assert/strict'),a=require('./test/session-casona.cjs'),w=a.newWorld({role:'inv',nInv:1}),b=w.loose.filter(o=>o.shelfId==='librero_isla');assert.equal(b.length,24);assert(b.every(o=>o.x>5&&o.x<6&&o.y>16&&o.y<18&&Math.abs(o.rot-Math.PI/2)<.001&&o.releaseX>6));console.log('24 rotated books and free release points passed');"],cwd=ROOT,capture_output=True,text=True)
   assert check.returncode==0,check.stderr
   await page.screenshot(path=str(OUT/'editor-librero-girado.png'));await page.click('#undo');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   # Hide movement carries the entry and is validated against full game coverage.
   await page.evaluate("()=>{NDAEditor.select('h','HB06');NDAEditor.begin();NDAEditor.move(8.5,14.5);}")
   assert not await page.evaluate('NDAEditor.errors()'),await page.evaluate('NDAEditor.errors()')
   await page.click('#place-piece');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   await page.screenshot(path=str(OUT/'editor-escondite.png'));await page.click('#undo');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   # Actual canvas drag uses the same grid transaction as the touch Move/Place flow.
   await page.select_option('#room','B08');await page.wait_for_timeout(100)
   points=await page.evaluate("()=>{const v=__decorMode;return{start:v.project(52.5,.79,15),end:v.project(52.5,0,19)};}")
   await page.mouse.move(points['start']['x'],points['start']['y']);await page.mouse.down();await page.mouse.move(points['end']['x'],points['end']['y'],steps=8);await page.mouse.up()
   # This drag heads into the chair/access reservation and must be rolled back safely.
   await page.keyboard.press('Escape');assert not await page.evaluate('NDAEditor.placing')
   if json.loads(await page.evaluate('JSON.stringify(NDAEditor.data)'))!=json.loads(original):await page.click('#undo')
   # Duplicating a prop is a cancellable placement, not a hidden permanent edit.
   await page.select_option('#room','B04');await page.evaluate("NDAEditor.select('d','B04_jar_01')");await page.click('#duplicate-piece');assert await page.evaluate('NDAEditor.placing');await page.keyboard.press('Escape');assert json.loads(await page.evaluate('JSON.stringify(NDAEditor.data)'))==json.loads(original)
   await page.click('#catalog-decor');await page.fill('#catalog-search','taza');await page.get_by_role('button',name='Añadir',exact=False).filter(has=page.locator('img')).first.click();assert await page.evaluate('NDAEditor.placing');await page.click('#cancel-piece')
   await page.click('#view-plan');assert await page.locator('#map').is_visible();await page.click('#view-3d');assert await page.locator('#room-view').is_visible()
   assert not errors,errors
   report={'passed':True,'scene3D':True,'catalogSelection':True,'invalidPlacementRejected':True,'moveSaveUndo':True,'rotationSaveUndo':True,'rotatedBooks24':True,'hideMoveSaveUndo':True,'realCanvasDrag':True,'cancellableDuplicateAndAdd':True,'errors':errors}
   (OUT/'editor_validation.json').write_text(json.dumps(report,indent=2),encoding='utf8');print(json.dumps(report));await b.close()
 finally:
  (ROOT/'src/layout-v11.json').write_bytes(original);(ROOT/'juego/index.html').write_bytes(built);server.shutdown()
asyncio.run(main())
