"""Real catalog drag/drop, furniture clipboard, floating errors and validated additions."""
import sys,asyncio,threading,runpy,json,subprocess
from pathlib import Path
from http.server import ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Editor_v21';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
async def main():
 mod=runpy.run_path(str(ROOT/'tools/editor_server.py'));server=ThreadingHTTPServer(('127.0.0.1',8790),mod['Editor']);threading.Thread(target=server.serve_forever,daemon=True).start()
 files=[ROOT/'src/layout-v11.json',ROOT/'juego/index.html',*list((ROOT/'arte/modulos-casona').glob('*.json'))];original={f:f.read_bytes()for f in files};errors=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=await b.new_page(viewport={'width':1440,'height':1100});page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.goto('http://127.0.0.1:8790/editor/');await page.wait_for_function('window.NDAOnline&&window.__decorMode');await page.locator('#online-panel').evaluate('(e)=>e.open=false')
   await page.select_option('#room','B06');await page.click('#catalog-furniture');await page.fill('#catalog-search','Librero de consulta');card=page.get_by_role('button',name='Añadir Librero de consulta',exact=True);await card.wait_for()
   await page.wait_for_timeout(100);point=await page.evaluate('__decorMode.project(8,0,16.5)');bounds=await page.locator('#room-view canvas').bounding_box()
   await card.drag_to(page.locator('#room-view canvas'),target_position={'x':point['x']-bounds['x'],'y':point['y']-bounds['y']})
   await page.wait_for_function("NDAEditor.data.obstacles.some(o=>o.editorSource==='librero_isla')&&!NDAEditor.placing")
   clone=await page.evaluate("NDAEditor.data.obstacles.find(o=>o.editorSource==='librero_isla')");assert clone['rect']==[7,16,9,17],clone
   assert not await page.evaluate('NDAEditor.errors()')
   await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   code="const a=require('./test/session-casona.cjs'),assert=require('node:assert/strict'),w=a.newWorld({role:'inv',nInv:1});const books=w.loose.filter(o=>o.shelfId==='"+clone['id']+"');assert.equal(books.length,24);const o=books[0];w.loose=[o];w.t=100;Object.assign(w.g,{f:o.f,x:o.x,y:o.y,state:'libre',hunt:null,stunUntil:0});w.g.ready.c=0;assert(a.gMover(w,w.g));assert.equal(o.h,0);console.log('24 copied books and real throw passed');"
   subprocess.run(['node','-e',code],cwd=ROOT,check=True)
   await page.screenshot(path=str(OUT/'catalogo-muebles.png'))
   # Errors overlay the scene, with stable scene/inspector positions.
   before=await page.locator('#room-view').bounding_box();aside=await page.locator('aside').bounding_box()
   await page.evaluate("()=>{NDAEditor.begin();NDAEditor.move(5,10);}");await page.wait_for_function('!document.querySelector("#error-panel").hidden')
   assert (await page.locator('#room-view').bounding_box())==before
   assert (await page.locator('aside').bounding_box())['y']==aside['y']
   await page.screenshot(path=str(OUT/'errores-flotantes.png'));await page.click('#cancel-piece')
   # Keyboard copy/paste across rooms, cancel, duplicate, delete and undo.
   await page.keyboard.press('Control+c');await page.select_option('#room','B08');await page.focus('#room');await page.keyboard.press('Control+v');assert await page.evaluate('NDAEditor.placing')
   assert await page.evaluate("NDAEditor.data.obstacles.at(-1).room")=='B08';await page.keyboard.press('Escape')
   await page.select_option('#room','B06');await page.evaluate('(id)=>NDAEditor.select("f",id)',clone['id']);await page.keyboard.press('Control+d');assert await page.evaluate('NDAEditor.placing');await page.keyboard.press('Escape')
   await page.click('#delete-piece');assert await page.evaluate("NDAEditor.data.obstacles.filter(o=>o.editorSource).length")==0
   await page.click('#undo');assert await page.evaluate("NDAEditor.data.obstacles.filter(o=>o.editorSource).length")==1
   await page.select_option('#room','B08');await page.evaluate("NDAEditor.select('f','am_silla_0')");await page.keyboard.press('Control+c');await page.select_option('#room','B06');await page.keyboard.press('Control+v');await page.evaluate("()=>{NDAEditor.move(10.5,17.5);if(!NDAEditor.commit())throw Error(NDAEditor.errors());}")
   # A copied wardrobe stays an independently addressed hide candidate with its prefab.
   result=await page.evaluate("()=>{NDAEditor.spawnHide('HB06');NDAEditor.move(3.5,16.5);if(!NDAEditor.commit())throw Error(NDAEditor.errors());return NDAEditor.data.hidingSockets.at(-1);}")
   await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   subprocess.run(['node','test/editor-navigation.cjs'],cwd=ROOT,check=True)
   await page.select_option('#room','B07');await page.check('#structure-mode');await page.wait_for_timeout(100);await page.screenshot(path=str(OUT/'barandales.png'))
   assert not errors,errors
   report={'passed':True,'nativeFurnitureDrag':True,'clipboardAcrossRooms':True,'chairPastedAndSavedInAnotherRoom':True,'duplicateCancelDeleteUndo':True,'copiedBooksThrow':24,'hideCopy':result['id'],'floatingErrorsStableLayout':True,'errors':errors};(OUT/'verificacion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report));await b.close()
 finally:
  for f,data in original.items():f.write_bytes(data)
  server.shutdown()
asyncio.run(main())
