"""Editor UI, safe local writes, observer cutaway and instrument component checks."""
import asyncio,sys,json,threading,runpy,copy
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Decoracion_Casona_v14';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
from http.server import ThreadingHTTPServer
async def main():
 editor=runpy.run_path(str(ROOT/'tools/editor_server.py'));server=ThreadingHTTPServer(('127.0.0.1',8790),editor['Editor']);threading.Thread(target=server.serve_forever,daemon=True).start();layout=(ROOT/'src/layout-v11.json').read_bytes();built=(ROOT/'juego/index.html').read_bytes();errors=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader']);page=await b.new_page(viewport={'width':1400,'height':950});page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.goto('http://127.0.0.1:8790/editor/');await page.wait_for_function("document.querySelector('#status').textContent.includes('Plano sin')");await page.locator('#preview canvas').wait_for();await page.select_option('#room','B04');await page.locator('[data-id="B04_jar_01"]').click();await page.locator('[data-field="rotation"]').fill('15');await page.locator('[data-field="rotation"]').press('Tab');await page.click('#undo');await page.select_option('#pieces','f:am_B04');await page.locator('[data-field="x"]').fill('39');await page.locator('[data-field="x"]').press('Tab');assert 'invade' in await page.inner_text('#status');await page.click('#undo');assert not await page.locator('#status').get_attribute('class'),await page.inner_text('#status');await page.select_option('#pieces','d:B04_jar_01');await page.evaluate('scrollTo(0,0)');await page.screenshot(path=str(OUT/'editor.png'))
   bad=json.loads(layout);next(o for o in bad['obstacles']if o['id']=='am_B04')['rect']=[39,8,41,9];response=await page.request.post('http://127.0.0.1:8790/api/layout',data=bad);assert response.status==422;assert (ROOT/'src/layout-v11.json').read_bytes()==layout
   await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')");assert json.loads((ROOT/'src/layout-v11.json').read_bytes())==json.loads(layout)
   source=built.decode('utf8').replace('requestAnimationFrame(frame);','/* Manual QA frames */').replace('window.__game =',"window.__qa={frame:()=>{updateCamera(1);updateScene(w.t,.5);updateCamera(1);renderer.render(scene,camera);},follow:n=>follow=n,inspect:()=>({upper:floorGroups[1].visible,ceilings:ceilMeshes.filter(m=>m.visible).length,cut:wallRuns.filter(r=>r.g.scale.y<.5).length,viewer:viewer().kind}),tools:()=>['termo','uv','grab','cam','emf','espejo','gases'].map(kind=>{const g=NDAToolArt.create(kind);NDAToolArt.update(g,{emfUntil:10,emfLvl:5,redUntil:10},1,true);return{kind,children:g.children.length,leds:g.userData.tool.leds.length};})};window.__game =")
   await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'));await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'));await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
   await page.goto('http://127.0.0.1:8790/juego/');await page.wait_for_function('window.__game');await page.evaluate("Object.assign(__game.menuOpt,{role:'bots',nInv:4,tips:'no'});__game.quality.select('balanced');__game.start.skipSlot=true;__game.start();")
   checks=[]
   for target in [0,1]:
    r=await page.evaluate("n=>{const w=__game.w,v=n?w.invs[0]:w.g;Object.assign(v,{x:52.5,y:16.5,f:0});w.g.stunUntil=1e9;__qa.follow(n);__qa.frame();return __qa.inspect();}",target);assert not r['upper'] and r['ceilings']==0 and r['cut']>0,r;checks.append(r)
   await page.add_style_tag(content='body{visibility:hidden!important}#stage,#stage *{visibility:visible!important}');await page.screenshot(path=str(OUT/'bots_investigador.png'))
   r=await page.evaluate("()=>{Object.assign(__game.w.invs[0],{f:1,x:50,y:35});__qa.frame();return __qa.inspect();}");assert r['upper'];checks.append(r)
   tools=await page.evaluate('__qa.tools()');assert tools[4]['leds']==5 and all(t['children']>=3 for t in tools);assert not errors,errors
   await page.goto('http://127.0.0.1:8790/arte/instrumentos-v14/');await page.locator('#view canvas').wait_for()
   for kind in ['termo','uv','grab','cam','emf','espejo','gases']:await page.select_option('#kind',kind)
   await page.select_option('#kind','emf');await page.screenshot(path=str(OUT/'instrumentos.png'));assert not errors,errors
   (OUT/'editor_observer_validation.json').write_text(json.dumps(dict(passed=True,editorPreview=True,undo=True,invalidDoorRejected=True,localSave=True,observer=checks,tools=tools,errors=errors),indent=2),encoding='utf8');print('Editor, local save/rollback, observer floors/cutaways and seven instrument factories passed.');await b.close()
 finally:
  (ROOT/'src/layout-v11.json').write_bytes(layout);(ROOT/'juego/index.html').write_bytes(built);server.shutdown()
asyncio.run(main())
