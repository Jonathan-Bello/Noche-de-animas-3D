"""Real input/snapshot flow over fake PeerJS; rendering checked separately."""
import sys,asyncio,json,re,threading,functools
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Decoracion_Casona_v13';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8783),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start()
 try:
  async with async_playwright() as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
   context=await b.new_context(viewport={'width':1000,'height':700});errors=[]
   source=re.sub(r'renderer\.render\([^;]+\);','/* Network QA: rendering verified in browser-layout-v11.py */',(ROOT/'juego/index.html').read_text(encoding='utf-8'))
   async def make():
    page=await context.new_page();page.on('pageerror',lambda e:errors.append(str(e)))
    await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
    await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'))
    await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
    await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
    await page.goto('http://127.0.0.1:8783/juego/');await page.wait_for_function('window.__game');return page
   host=await make();guest=await make()
   await host.evaluate("Object.assign(__game.menuOpt,{char:'curandero',nInv:2,ghost:'pena',tips:'no'});__game.quality.select('low');__game.start.skipSlot=true")
   await host.fill('#onName','Anfitrión');await host.click('#onHost');await host.wait_for_timeout(300);code=await host.evaluate('__game.NET.code')
   await guest.evaluate("__game.menuOpt.char='rafael';__game.menuOpt.tips='no';__game.quality.select('low')")
   await guest.fill('#onName','Invitado');await guest.fill('#onCode',code);await guest.click('#onJoin');await guest.wait_for_timeout(600)
   await host.click('#onStart');await host.locator('#slotGo').click();await guest.wait_for_function('__game.w&&__game.ME===1');await host.wait_for_timeout(700)
   assert await host.evaluate('__game.w.layout')=='casona-v13';assert await guest.evaluate('__game.w.layout')=='casona-v13'
   before=await host.evaluate('__game.w.invs[1].y');await guest.keyboard.down('w');await guest.wait_for_timeout(1400);await guest.keyboard.up('w');await guest.wait_for_timeout(300);after=await host.evaluate('__game.w.invs[1].y');assert before-after>.5,(before,after)
   old=await host.evaluate('__game.w.invs[1].flash');await guest.keyboard.press('f');await guest.wait_for_timeout(300);assert await host.evaluate('__game.w.invs[1].flash')!=old
   state="()=>{const w=__game.w;return{layout:w.layout,hides:[...w.spotsActive].sort(),altar:w.altarSurface,fuseRoom:w.fuseRoom,doors:w.doors.length,drawers:w.containers.length}}"
   hs=await host.evaluate(state);gs=await guest.evaluate(state);assert hs==gs,(hs,gs)
   cid=await host.evaluate("()=>{const w=__game.w,c=w.containers.find(c=>c.items.length&&nearSpot(w,{...w.invs[0],f:c.f,x:c.ax,y:c.ay,hidden:-1})<0&&!w.items.some(it=>!it.holder&&it.f===c.f&&layoutItemVisible(w,it)&&Math.hypot(it.x-c.ax,it.y-c.ay)<1.3)),i=w.invs[0];Object.assign(i,{f:c.f,x:c.ax,y:c.ay,vx:0,vy:0,hidden:-1});w.g.stunUntil=1e9;return c.id;}")
   await host.keyboard.press('e')
   await host.wait_for_function('(id)=>__game.w.containers[id].open',arg=cid,timeout=10000)
   await guest.wait_for_function('(id)=>__game.w.containers[id].open',arg=cid,timeout=10000)
   book=await host.evaluate("()=>{const w=__game.w,o=w.loose.find(o=>o.shelfId),g=w.g;for(const p of w.loose)if(p!==o)p.flyT=w.t;Object.assign(g,{bot:false,f:o.f,x:o.x,y:o.y+1,state:'libre',hunt:null,stunUntil:0});g.ready.c=0;g.def.freq.c=1;if(!gMover(w,g))throw Error('Book throw failed');netBroadcast(w);return{id:o.id,x:o.x,y:o.y,h:o.h};}")
   await guest.wait_for_timeout(400)
   received=await guest.evaluate('(id)=>{const o=__game.w.loose.find(o=>o.id===id);return{id:o.id,x:o.x,y:o.y,h:o.h};}',book['id'])
   assert received['id']==book['id'] and received['h']==0 and abs(received['x']-book['x'])<.002 and abs(received['y']-book['y'])<.002,(book,received)
   sizes=await host.evaluate('[JSON.stringify(netEnc(__game.w,true)).length,JSON.stringify(netEnc(__game.w,false)).length]')
   await guest.close();await host.wait_for_timeout(400);assert await host.evaluate('__game.w.invs[1].left')
   assert not errors,errors;result={'passed':True,'movementOnHost':before-after,'flashSynced':True,'layoutAndRandomStateSynced':True,'drawerOpenSynced':True,'independentBookThrowSynced':True,'disconnectHandled':True,'snapshotBytes':sizes,'errors':errors,'note':'PeerJS transport shim; drawing tested independently, no WAN latency benchmark.'};(OUT/'online_validation.json').write_text(json.dumps(result,indent=2),encoding='utf-8');print(json.dumps(result));await b.close()
 finally:server.shutdown()
asyncio.run(main())
