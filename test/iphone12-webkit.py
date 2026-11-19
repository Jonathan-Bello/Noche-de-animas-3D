"""WebKit compatibility and the bundled iPhone 12 device profile, not Apple GPU emulation."""
import asyncio,sys,json,threading,functools,os
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Decoracion_Casona_v16';OUT.mkdir(exist_ok=True)
os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH',str(ROOT.parent/'QA_Arte_Alex/browsers'))
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8785),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   b=await p.webkit.launch();reports=[]
   for device in ['iPhone 12','iPhone 12 landscape']:
    profile={k:v for k,v in p.devices[device].items() if k!='default_browser_type'}
    ctx=await b.new_context(**profile);page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    source=(ROOT/'juego/index.html').read_text(encoding='utf8').replace('requestAnimationFrame(frame);','/* Manual compatibility frames */').replace('window.__game =','window.__qa={frame:()=>{updateCamera(1);updateScene(w.t,.1);updateCamera(1);hud();renderer.render(scene,camera);},get renderer(){return renderer;}};window.__game =')
    await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
    await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'))
    await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
    await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
    await page.goto('http://127.0.0.1:8785/juego/');await page.wait_for_function('window.__game')
    await page.evaluate("Object.assign(__game.menuOpt,{role:'inv',nInv:4,ghost:'pena',char:'curandero',tips:'no',cam:'fp'});__game.quality.select('auto');__game.start.skipSlot=true;__game.start();")
    await page.wait_for_timeout(1300)
    intro=page.get_by_role('button',name='A la casona',exact=True)
    if await intro.count():await intro.tap()
    data=await page.evaluate("()=>{const w=__game.w;Object.assign(w.invs[0],{f:0,x:35.5,y:25.5});__qa.frame();const r=__qa.renderer,gl=r.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return{layout:w.layout,viewport:{width:innerWidth,height:innerHeight},deviceDpr:devicePixelRatio,renderDpr:r.getPixelRatio(),shadows:r.shadowMap.enabled,draw:{...r.info.render},renderer:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):null};}")
    assert data['layout']=='casona-v16';assert data['renderDpr']==1;assert not data['shadows'];assert data['draw']['triangles']>0;assert not errors,errors
    data['device']=device;data['errors']=errors;reports.append(data);await page.screenshot(path=str(OUT/('iphone12-landscape.png' if 'landscape' in device else 'iphone12.png')));await ctx.close();print('WEBKIT',device,flush=True)
   (OUT/'iphone12_validation.json').write_text(json.dumps({'passed':True,'profiles':reports,'note':'WebKit on Windows with emulated iPhone dimensions/input, not an iPhone GPU or physical FPS measurement.'},indent=2),encoding='utf8');await b.close()
 finally:server.shutdown()
asyncio.run(main())
