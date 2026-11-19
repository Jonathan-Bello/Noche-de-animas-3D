"""Complete browser session, adaptive-resolution guard and furnished-plan interactions."""
import asyncio,sys,json,threading,functools
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Decoracion_Casona_v16';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8784),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   ctx=await b.new_context(viewport={'width':390,'height':844},device_scale_factor=2,is_mobile=True,has_touch=True);page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   source=(ROOT/'juego/index.html').read_text(encoding='utf-8').replace('requestAnimationFrame(frame);','/* Manual QA frames */').replace('window.__game =','window.__qa={frame:()=>{updateScene(w.t,.1);updateCamera(1);hud();renderer.render(scene,camera);},get renderer(){return renderer;}};window.__game =')
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'))
   await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
   await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
   await page.goto('http://127.0.0.1:8784/juego/');await page.wait_for_function('window.__game')
   await page.evaluate("()=>{let s=73;Math.random=()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;};Object.assign(__game.menuOpt,{role:'bots',nInv:4,ghost:'pena',night:600,tips:'no'});__game.quality.select('low');__game.start.skipSlot=true;__game.start();}")
   result=None;frames=[]
   for k in range(150):
    r=await page.evaluate("()=>{const w=__game.w;for(let n=0;n<100&&!w.over;n++)__game.step(w,.1);__qa.frame();return{t:w.t,over:w.over?{win:w.over.win,cause:w.over.cause}:null,hunts:w.stats.hunts,draw:{...__qa.renderer.info.render},finite:w.invs.every(i=>Number.isFinite(i.x)&&Number.isFinite(i.y))};}")
    assert r['finite'];frames.append(r['draw'])
    if k==12:await page.screenshot(path=str(OUT/'sesion-movil.png'))
    if r['over']:result=r;break
   assert result,'Browser session did not finish'
   adaptive=await page.evaluate("()=>{const q=__game.quality,r=__qa.renderer;for(let k=0;k<800;k++)q.frame(r,70,k*70+1);const low={scale:q.resolutionScale,dpr:r.getPixelRatio()};for(let k=0;k<1600;k++)q.frame(r,16,60000+k*16);return{low,recovered:q.resolutionScale};}")
   assert .64<=adaptive['low']['scale']<=.66;assert adaptive['recovered']>.65
   await page.goto('http://127.0.0.1:8784/arte/decoracion-v16/');await page.select_option('#rooms','B06');assert 'Librero de consulta' in await page.inner_text('#selection');assert await page.locator('#plan').get_attribute('viewBox')!='-1 -1 62 43';await page.click('#pa');await page.select_option('#rooms','A04');assert 'Cómoda de la nana' in await page.inner_text('#selection');assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth')
   await page.screenshot(path=str(OUT/'croquis-movil.png'),full_page=True)
   await page.set_viewport_size({'width':1400,'height':900});await page.click('#pb');await page.screenshot(path=str(OUT/'croquis.png'));await page.select_option('#rooms','B06');await page.screenshot(path=str(OUT/'croquis-biblioteca.png'))
   assert not errors,errors
   report={'passed':True,'completeBrowserSession':result,'adaptiveSyntheticSlowFrames':adaptive,'renderSamples':frames,'planInteractionsPassed':True,'errors':errors,'note':'Touch-screen emulation and software renderer, not physical-phone FPS.'};(OUT/'review_validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8');print(json.dumps({k:v for k,v in report.items() if k!='renderSamples'}));await b.close()
 finally:server.shutdown()
asyncio.run(main())
