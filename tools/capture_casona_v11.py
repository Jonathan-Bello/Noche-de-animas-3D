"""Capture reproducible live game views and validate rebuilt geometry in Edge."""
import sys,asyncio,json,threading,functools
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Revision_Casona_v12';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8781),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   page=await b.new_page(viewport={'width':1440,'height':960});errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
   await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
   source=(ROOT/'juego/index.html').read_text(encoding='utf-8').replace('requestAnimationFrame(frame);','/* QA manual frames */').replace('window.__game =','window.__qa={frame:()=>{updateCamera(1);updateScene(w.t,.25);updateCamera(1);renderer.render(scene,camera);},get renderer(){return renderer;},setPitch:p=>pitch=p};\nwindow.__game =')
   await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
   await page.goto('http://127.0.0.1:8781/juego/');await page.wait_for_function('window.__game')
   await page.evaluate("Object.assign(__game.menuOpt,{role:'inv',nInv:1,char:'curandero',tips:'no',cam:'fp'});__game.quality.select('balanced');__game.start.skipSlot=true;__game.start();")
   await page.wait_for_timeout(1500)
   await page.add_style_tag(content='body{visibility:hidden!important}#stage,#stage *{visibility:visible!important}')
   views=[('fachada',0,30,44,-1.5708,.22),('zaguan',0,30,37,-1.5708,.12),('capilla',0,30,8,-1.5708,.04),('patio',0,35,25,-2.20,.18),('escalera_principal',0,12.6,26.3,3.14159,.28),('escalera_servicio',0,38.5,4.5,-.25,.25),('coro',1,30,8,-1.5708,-.08),('galeria',1,38,28,-2.7,.06),('biblioteca',0,10.5,17.5,-2.2,-.05),('comedor',0,47.5,18,-.4,-.08),('base',0,30,49,2.3,-.05)]
   for name,f,x,y,yaw,pitch in views:
    await page.evaluate("p=>{const w=__game.w,m=w.invs[__game.ME];Object.assign(m,{f:p.f,x:p.x,y:p.y,hidden:-1,alive:true,face:p.yaw});w.g.hunt=null;w.g.stunUntil=9999;w.lights.forEach(a=>a.fill(1));w.burnt.forEach(a=>a.fill(0));w.fuse=[true,true];__game.setYaw(p.yaw);__qa.setPitch(p.pitch);__qa.frame();}",dict(f=f,x=x,y=y,yaw=yaw,pitch=pitch))
    await page.screenshot(path=str(OUT/(name+'.png')));print('VIEW',name,flush=True)
    if name=='fachada':
     facade=await page.evaluate("async()=>{const {Raycaster,Vector3}=await import('/test/three.module.js'),meshes=[];__game.scene.traverse(o=>{if(o.isMesh)meshes.push(o)});return[24.5,25.5,26.5,27.5,28.5,31.5,32.5,33.5,34.5].map(x=>{const ray=new Raycaster(new Vector3(x,2,44),new Vector3(0,0,-1));return{x,hits:ray.intersectObjects(meshes,false).slice(0,2).map(h=>({name:h.object.name,z:h.point.z}))};});}")
     print('FACADE',json.dumps(facade),flush=True)
     assert all(r['hits'] and abs(r['hits'][0]['z']-40)<.01 for r in facade),facade
   metrics=await page.evaluate("()=>{let vertices=0,invalid=0,meshes=0;__game.scene.traverse(o=>{if(!o.isMesh)return;meshes++;const a=o.geometry.attributes.position;if(!a)return;vertices+=a.count;for(const v of a.array)if(!Number.isFinite(v))invalid++;});return{meshes,vertices,invalid,draw:__qa.renderer.info.render,version:__game.art.version,quality:__game.art.quality};}")
   result={'errors':errors,'metrics':metrics};(OUT/'render_validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result));assert not errors;assert metrics['invalid']==0;await b.close()
 finally:server.shutdown()
asyncio.run(main())
