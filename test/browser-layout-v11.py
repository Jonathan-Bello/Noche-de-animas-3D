"""Browser integration checks for quality, cupboard actions and render geometry."""
import sys,asyncio,json,threading,functools
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Decoracion_Casona_v14';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8782),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   source=(ROOT/'juego/index.html').read_text(encoding='utf-8').replace('requestAnimationFrame(frame);','/* QA manual frames */').replace('window.__game =','window.__qa={frame:()=>{updateScene(w.t,.25);updateCamera(1);hud();renderer.render(scene,camera);},action:primaryAction,get renderer(){return renderer;},setPitch:p=>pitch=p};\nwindow.__game =')
   result=[];errors=[]
   for quality,mobile in [('low',False),('balanced',False),('high',False),('auto',True)]:
    ctx=await b.new_context(viewport={'width':390 if mobile else 1280,'height':844 if mobile else 800},device_scale_factor=2,is_mobile=mobile,has_touch=mobile)
    page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text) if m.type=='error' else None)
    await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
    await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
    await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'))
    await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
    await page.goto('http://127.0.0.1:8782/juego/');await page.wait_for_function('window.__game')
    await page.locator(f'.seg[data-name="quality"] button[data-v="{quality}"]').click()
    assert await page.evaluate("localStorage.getItem('nda_visual_quality')")==quality
    await page.evaluate("Object.assign(__game.menuOpt,{role:'inv',nInv:1,char:'curandero',tips:'no',cam:'fp'});__game.start.skipSlot=true;__game.start();")
    await page.wait_for_timeout(1300)
    data=await page.evaluate("()=>{const w=__game.w,m=w.invs[0];Object.assign(m,{x:35.5,y:25.5,f:0,flash:true});w.g.stunUntil=1e9;__qa.frame();let invalid=0;__game.scene.traverse(o=>{for(const v of o.matrixWorld.elements)if(!Number.isFinite(v))invalid++;if(o.isMesh&&o.geometry.attributes.position)for(const x of o.geometry.attributes.position.array)if(!Number.isFinite(x))invalid++;});return{version:w.layout,quality:__game.quality.preference,shadows:__qa.renderer.shadowMap.enabled,dpr:__qa.renderer.getPixelRatio(),active:w.spotsActive.size,drawers:w.containers.length,invalid,draw:__qa.renderer.info.render};}")
    assert data['version']=='casona-v14';assert 20<=data['active']<=22;assert data['drawers']==66;assert data['invalid']==0
    assert data['shadows']==(quality not in ['low','auto']);assert data['dpr']<=({'low':1,'balanced':1.35,'high':2,'auto':1}[quality])
    if quality=='balanced':
     await page.evaluate('()=>{'+(ROOT/'test/scene-geometry-qc.js').read_text(encoding='utf-8')+';window.auditSceneGeometry=auditSceneGeometry;}')
     audit=await page.evaluate('auditSceneGeometry(__game.scene)');print('GEOMETRY',json.dumps(audit),flush=True)
     assert audit['portals']==len(json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf-8'))['doors']);assert audit['windows']==20;assert audit['nonFinite']==0;assert audit['mixedFaceColors']==0;assert not audit['coplanarOverlaps'],audit
     data['geometryAudit']=audit
    result.append(data)
    if not mobile and quality=='balanced':
     action=await page.evaluate("()=>{"+(ROOT/'test/fixture-drawer.js').read_text(encoding='utf-8')+";const c=prepareDrawerFixture(__game.w,__game.w.invs[0]);window.__testDrawer=c.id;return __qa.action(__game.w.invs[0]);}")
     assert action['txt'].endswith('(1 s)'),action
     opened=await page.evaluate("()=>{const w=__game.w,m=w.invs[0],c=w.containers[window.__testDrawer];interact(w,m);for(let k=0;k<40;k++)__game.step(w,1/30,{mx:0,my:0,press:new Set()});__qa.frame();return{open:c.open,visible:c.items.every(id=>layoutItemVisible(w,w.items.find(it=>it.id===id)))};}")
     assert opened=={'open':True,'visible':True},opened
     for n in range(2):
      await page.evaluate('__game.start.skipSlot=true;__game.start()');await page.wait_for_timeout(100);await page.evaluate('__qa.frame()')
    if mobile:await page.screenshot(path=str(OUT/'movil.png'))
    await ctx.close();print('QUALITY',quality,flush=True)
   assert not errors,errors
   (OUT/'browser_validation.json').write_text(json.dumps({'passed':True,'profiles':result,'errors':errors,'note':'Emulated screen/input and software rendering; no physical-device FPS claim.'},indent=2),encoding='utf-8')
   print(json.dumps({'passed':True,'profiles':len(result),'errors':errors}));await b.close()
 finally:server.shutdown()
asyncio.run(main())
