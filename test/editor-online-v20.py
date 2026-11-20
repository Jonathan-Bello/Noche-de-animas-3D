"""Shared-room protocol, online publication UI and structural edits. GitHub/Peer transport mocked."""
import sys,asyncio,threading,runpy,json,base64,copy
from pathlib import Path
from http.server import ThreadingHTTPServer
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Editor_v20';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
async def main():
 mod=runpy.run_path(str(ROOT/'tools/editor_server.py'));server=ThreadingHTTPServer(('127.0.0.1',8790),mod['Editor']);threading.Thread(target=server.serve_forever,daemon=True).start()
 original=(ROOT/'src/layout-v11.json').read_bytes();built=(ROOT/'juego/index.html').read_bytes();errors=[];requests=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']);ctx=await b.new_context(viewport={'width':1440,'height':1050})
   await ctx.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
   await ctx.route('**/peerjs*',lambda r:r.fulfill(path=str(ROOT/'test/fakepeer.js'),content_type='application/javascript'))
   async def make(url):
    page=await ctx.new_page();page.on('pageerror',lambda e:errors.append(str(e)));await page.goto(url);await page.wait_for_function('window.NDAOnline&&window.__decorMode');return page
   host=await make('http://127.0.0.1:8790/editor/');await host.click('#host-session');await host.wait_for_function('document.querySelector("#invite-link").value.includes("sala=")');invite=await host.input_value('#invite-link')
   guest=await make(invite);await guest.wait_for_function('document.querySelector("#session-state").textContent.startsWith("Conectado")');await host.wait_for_function('document.querySelector("#session-state").textContent.includes("1 invitado")')
   # A guest commits, host accepts, both receive one authoritative revision.
   await guest.evaluate("()=>{NDAEditor.select('f','librero_isla');NDAEditor.begin();NDAEditor.move(5,17);if(!NDAEditor.commit())throw Error(NDAEditor.errors());}")
   await host.wait_for_function("NDAEditor.data.obstacles.find(o=>o.id==='librero_isla').rect[1]===17")
   assert await host.evaluate('JSON.stringify(NDAEditor.data)')==await guest.evaluate('JSON.stringify(NDAEditor.data)')
   print('Guest edit received',flush=True)
   await host.click('#undo');await guest.wait_for_function("NDAEditor.data.obstacles.find(o=>o.id==='librero_isla').rect[1]===14")
   await guest.select_option('#room','B06');await guest.evaluate("()=>{NDAEditor.spawnFurniture('librero_isla');NDAEditor.move(8,16.5);if(!NDAEditor.commit())throw Error(NDAEditor.errors());}");await host.wait_for_function("NDAEditor.data.obstacles.some(o=>o.editorSource==='librero_isla')");await host.click('#undo');await guest.wait_for_function("!NDAEditor.data.obstacles.some(o=>o.editorSource)")
   print('Undo and added furniture received',flush=True)
   # A stale edit is explicitly rejected, with a recoverable draft.
   await guest.evaluate("()=>{const c=[...__fp[0].conns.values()][0];c.send({kind:'edit',revision:-1,layout:NDAEditor.data});}")
   await guest.wait_for_function('document.querySelector("#online-message").textContent.includes("Otro cambio llegó primero")');assert await guest.locator('#download-conflict').is_visible()
   print('Conflict received',flush=True)
   # No data sent to guests or persisted in localStorage should contain the publishing credential.
   mockbase=json.loads(original);published={'layout':mockbase};pending={'version':1,'id':None}
   def file(content,sha):return {'sha':sha,'content':base64.b64encode(json.dumps(content,ensure_ascii=False).encode()).decode()}
   async def github(route):
    req=route.request;path=req.url.split('api.github.com',1)[1];out={}
    if path=='/user':out={'login':'editor-test'}
    elif '/contents/src/layout-v11.json'in path:out=file(published['layout'],'base-layout-sha')
    elif '/contents/editor-publications/request.json'in path:
     if req.method=='PUT':
      body=req.post_data_json;data=json.loads(base64.b64decode(body['content']));requests.append(data);pending.update(data);published['layout']=data['layout'];out={'commit':{'sha':'test-commit'}}
     else:out=file(pending,'request-sha')
    elif '/contents/editor-publications/status.json'in path:out=file({'id':pending['id'],'state':'validated','runId':123},'status-sha')
    elif '/actions/runs/'in path:out={'status':'completed','conclusion':'success'}
    await route.fulfill(json=out,headers={'access-control-allow-origin':'*'})
   await host.route('https://api.github.com/**',github)
   await host.click('#connect-github');await host.fill('#github-token','TEST-PUBLISH-CREDENTIAL');await host.click('#authorize-github');await host.wait_for_function('NDAOnline.canPublish');assert await host.input_value('#github-token')==''
   await host.evaluate("window._oldTimeout=setTimeout;window.setTimeout=(f,n,...a)=>_oldTimeout(f,n===6000?25:n,...a)")
   await host.click('#publish-github');await host.wait_for_function('document.querySelector("#online-message").textContent.startsWith("Publicado:")');assert requests[0]['baseSHA']=='base-layout-sha'
   assert 'TEST-PUBLISH-CREDENTIAL'not in await host.evaluate('JSON.stringify(localStorage)')
   assert 'TEST-PUBLISH-CREDENTIAL'not in await guest.evaluate('document.documentElement.textContent+JSON.stringify(localStorage)')
   print('Mock publication complete',flush=True)
   await host.click('#leave-session');await guest.wait_for_function('!NDAOnline.connected')
   # Explain invalid placements in Spanish and show the live list.
   await host.select_option('#room','B06');await host.evaluate("()=>{NDAEditor.select('f','librero_isla');NDAEditor.begin();NDAEditor.move(5,10);}");await host.wait_for_function('!document.querySelector("#error-panel").hidden');text=await host.locator('#placement-errors').inner_text();assert 'bloquea el paso'in text or 'límites'in text
   await host.click('#cancel-piece')
   # Move the whole principal staircase one metre west and validate a local save.
   await host.select_option('#room','B07');await host.check('#structure-mode');await host.get_by_role('button',name='Seleccionar Escalera principal',exact=True).click()
   assert await host.locator('#rotate-piece').is_disabled()
   await host.evaluate("()=>{const s=NDAEditor.data.stairs[0];NDAEditor.begin();NDAEditor.move((s.hole[0]+s.hole[2])/2-1,(s.hole[1]+s.hole[3])/2);if(!NDAEditor.commit())throw Error(NDAEditor.errors());}")
   print('Saving translated stair',flush=True)
   await host.click('#save');await host.wait_for_function('document.querySelector("#status").textContent.startsWith("Guardado")');saved=json.loads((ROOT/'src/layout-v11.json').read_text(encoding='utf8'));assert saved['stairs'][0]['hole'][0]==5.8
   assert saved['stairs'][0]['navPaths'][0][0]==[10,26]
   await host.screenshot(path=str(OUT/'editor-escalera.png'))
   await host.click('#undo');await host.click('#save');await host.wait_for_function('document.querySelector("#status").textContent.startsWith("Guardado")')
   await host.select_option('#room','B08');await host.screenshot(path=str(OUT/'editor-publico.png'))
   assert not errors,errors
   report={'passed':True,'guestEditAndHostUndo':True,'guestFurnitureAdditionAndHostUndo':True,'conflictDraft':True,'githubUIWithMockAPI':True,'credentialsNotSharedOrPersisted':True,'spanishErrors':text,'translatedStairSavedWithNavigation':True,'transport':'Fake PeerJS and mocked GitHub API; real local game validation','errors':errors}
   (OUT/'verificacion.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(report,ensure_ascii=False));await b.close()
 finally:(ROOT/'src/layout-v11.json').write_bytes(original);(ROOT/'juego/index.html').write_bytes(built);server.shutdown()
asyncio.run(main())
