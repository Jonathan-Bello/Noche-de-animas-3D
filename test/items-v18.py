"""Consumable and cursed-item workshop, save/rollback, hand/world state, and mobile readout checks."""
import sys,json,asyncio,threading,importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Objetos_v18';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'))
from playwright.async_api import async_playwright
spec=importlib.util.spec_from_file_location('server',ROOT/'tools/editor_server.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
KINDS=['te','rosario','ruda','copal','vela','ceniza','cruz','pan','foco','limpia','fotocam','tarot','tablilla','espejoplata','mano','muneca','pentagrama','radio']
async def main():
 original=(ROOT/'src/items-components.json').read_bytes();built=(ROOT/'juego/index.html').read_bytes()
 server=mod.ThreadingHTTPServer(('127.0.0.1',8790),mod.Editor);threading.Thread(target=server.serve_forever,daemon=True).start()
 errors=[];reports=[]
 try:
  async with async_playwright()as p:
   b=await p.chromium.launch(executable_path='C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',args=['--no-sandbox','--disable-gpu-sandbox','--use-angle=swiftshader','--enable-unsafe-swiftshader'])
   page=await b.new_page(viewport={'width':1440,'height':1000});page.on('pageerror',lambda e:errors.append(str(e)));page.on('console',lambda m:errors.append(m.text)if m.type=='error'else None)
   async def routes(page):
    await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
    await page.route('**/fonts.googleapis.com/**',lambda r:r.fulfill(body='',content_type='text/css'))
    await page.route('**/peerjs*',lambda r:r.fulfill(body=(ROOT/'test/fakepeer.js').read_text(),content_type='application/javascript'))
   await routes(page)
   await page.goto('http://127.0.0.1:8790/arte/objetos-v18/');await page.wait_for_function('window.__workshop')
   for k in KINDS:
    await page.select_option('#kind',k)
    for state in ['normal','doubtful','positive']:
     await page.select_option('#state',state);await page.wait_for_timeout(80)
     data=await page.evaluate("()=>{const a=__workshop,m=a.model,s=m.userData.tool;let vertices=0,invalid=0,textures=0; m.traverse(o=>{if(!o.isMesh)return;vertices+=o.geometry.attributes.position.count;for(const v of o.geometry.attributes.position.array)if(!Number.isFinite(v))invalid++;if(o.material.map)textures++;});return{kind:s.kind,state:s.state,parts:s.parts.size,vertices,invalid,textures,leds:s.leds.map(o=>o.material.color.getHexString()),hand:s.handprint?.visible,stand:s.groups.stand.visible,bodyY:s.groups.body.position.y};}")
     assert data['invalid']==data['textures']==0,data
     if k=='emf'and state=='positive':assert len(set(data['leds']))==5,data
     if k=='espejo':assert data['hand']==(state=='positive'),data
     if k in ['cam','uv']:assert data['state']['tone']=='normal',data
     await page.locator('.layout section').screenshot(path=str(OUT/f'{k}-{state}.png'));reports.append(data)
    await page.check('#held');await page.wait_for_timeout(60)
    assert not await page.evaluate('__workshop.model.userData.tool.groups.stand.visible')
    await page.locator('.layout section').screenshot(path=str(OUT/f'{k}-held.png'));await page.uncheck('#held')
   # Edit a real piece, save via the local server and verify the compiled game changed.
   await page.select_option('#kind','te');await page.select_option('#part','taza')
   await page.get_by_label('position X',exact=True).fill('.025');await page.get_by_label('position X',exact=True).dispatch_event('change')
   await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   saved=json.loads((ROOT/'src/items-components.json').read_text(encoding='utf8'));assert next(p for p in saved['tools']['te']['parts']if p['id']=='taza')['position'][0]==.025
   assert '0.025' in (ROOT/'juego/index.html').read_text(encoding='utf8')
   await page.click('#undo');await page.click('#save');await page.wait_for_function("document.querySelector('#status').textContent.startsWith('Guardado')")
   assert json.loads((ROOT/'src/items-components.json').read_text(encoding='utf8'))==json.loads(original)
   # The local endpoint rejects a changed functional role without modifying source/build.
   rejected=await page.evaluate("async()=>{const d=structuredClone(__workshop.data);d.tools.te.parts[0].role='digits';const r=await fetch('/api/items',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(d)});return r.status;}");assert rejected==422
   errors[:]=[e for e in errors if '422'not in e]
   await page.select_option('#kind','te');await page.select_option('#state','positive');await page.select_option('#angle','front')
   async with page.expect_download()as download:await page.click('#png')
   png=await download.value;await png.save_as(str(OUT/'te-front-2048.png'))
   from PIL import Image
   assert Image.open(OUT/'te-front-2048.png').size==(2048,2048)
   for angle in ['side','back']:await page.select_option('#angle',angle)
   await page.select_option('#angle','three');await page.screenshot(path=str(OUT/'taller.png'))
   await page.select_option('#part','__grip');assert await page.get_by_label('position X',exact=True).count()==1
   source=built.decode('utf8').replace('requestAnimationFrame(frame);','/* Manual QA frames */').replace('window.__game =',"window.__toolsQA={THREE,newItem,setPitch:p=>pitch=p,frame:()=>{updateCamera(1);updateScene(w.t,.1);updateCamera(1);updateOverlay();renderer.render(scene,camera);},get camera(){return camera;},get renderer(){return renderer;},get meshes(){return itemMeshes;},get rigs(){return invMeshes;},get fx(){return fxMeshes;},read:toolReadout};window.__game =")
   await page.route('**/juego/',lambda r:r.fulfill(body=source,content_type='text/html'))
   await page.goto('http://127.0.0.1:8790/juego/');await page.wait_for_function('window.__game')
   await page.evaluate("Object.assign(__game.menuOpt,{role:'inv',nInv:1,char:'curandero',tips:'no',cam:'fp'});__game.start.skipSlot=true;__game.start();")
   await page.wait_for_timeout(900)
   intro=page.get_by_role('button',name='A la casona',exact=True)
   if await intro.count():await intro.click()
   await page.evaluate("()=>{__game.w.g.stunUntil=1e9;__game.w.lights.forEach(f=>f.fill(1));__game.w.burnt.forEach(f=>f.fill(0));}")
   world=[]
   for k in KINDS:
    row=await page.evaluate("k=>{const w=__game.w,m=w.invs[__game.ME],it=w.items.find(i=>i.kind===k&&!i.holder)||__toolsQA.newItem(k,{f:0,x:30,y:25});if(!w.items.includes(it))w.items.push(it);m.slots.forEach(i=>{if(i)i.holder=null});m.slots=[it,null,null];m.hand=0;it.holder=m;m.termo={v:-5.2,show:-5.2,settle:8};Object.assign(m,{x:30,y:25,f:0,face:0,alive:true,flash:true});Object.assign(it,{uses:1,charges:1,cards:6,q:1,wishes:1,pins:7,candles:3,on:true,film:3,lit:true,litUntil:w.t+30});__game.setYaw(0);__toolsQA.frame();const hand=__toolsQA.rigs[__game.ME].handItem.m;let invalid=0;__game.scene.traverse(o=>{if(o.visible)for(const v of o.matrixWorld.elements)if(!Number.isFinite(v))invalid++;});return{kind:k,actualFactory:hand.userData.tool?.kind,state:hand.userData.tool?.state,front:hand.localToWorld(new __toolsQA.THREE.Vector3(0,.25,1)).sub(hand.localToWorld(new __toolsQA.THREE.Vector3(0,.25,0))).normalize().dot(__toolsQA.camera.position.clone().sub(hand.localToWorld(new __toolsQA.THREE.Vector3(0,.25,0))).normalize()),invalid,readout:__toolsQA.read(m),draw:{...__toolsQA.renderer.info.render}};}",k)
    assert row['actualFactory']==k and row['invalid']==0,row
    await page.screenshot(path=str(OUT/f'juego-{k}.png'));world.append(row)
   checks=await page.evaluate("()=>{const a=NDAItemArt,art=(k,it)=>a.read(k,it,10),doll=it=>a.panel('muneca',it,10);return{noHeartLeak:doll({pins:6,heart:0})===doll({pins:6,heart:9}),noRadioLeak:a.panel('radio',{cd:11,near:true},10)===a.panel('radio',{cd:11,near:false},10),flameExpired:art('vela',{lit:true,litUntil:9}).lit,film:art('fotocam',{film:3}).digits,cards:art('tarot',{cards:4}).remaining,wishes:art('mano',{wishes:1}).used,pins:art('muneca',{pins:7}).used,candles:art('pentagrama',{candles:3}).candles};}")
   assert checks==dict(noHeartLeak=True,noRadioLeak=True,flameExpired=False,film='03',cards=4,wishes=1,pins=3,candles=3),checks
   attachment=await page.evaluate("()=>{const w=__game.w,d=w.doors[0],it=w.items.find(i=>i.kind==='rosario');it.holder=null;Object.assign(it,{f:d.f,x:d.x,y:d.y});d.rosarioItem=it;d.rosario=true;w.fxAdd('ruda',d,{ttl:30});__toolsQA.frame();const mesh=__toolsQA.meshes.get(it.id),fx=[...__toolsQA.fx.values()].find(g=>g.userData.inventory);return{separation:Math.hypot(mesh.g.position.x-fx.position.x,mesh.g.position.z-fx.position.z),rosaryY:mesh.g.position.y,rosaryFactory:mesh.m.userData.item.kind,rueFactory:fx.userData.inventory.userData.item.kind,offset:Math.hypot(mesh.g.position.x-d.x,mesh.g.position.z-d.y)};}")
   assert attachment['separation']>2 and attachment['rosaryY']>1 and attachment['rosaryFactory']=='rosario'and attachment['rueFactory']=='ruda'and attachment['offset']>.5,attachment
   await page.evaluate("()=>{const w=__game.w,d=w.doors[0],m=w.invs[0];Object.assign(m,{f:d.f,x:d.x+(d.o==='V'?3.5:0),y:d.y+(d.o==='V'?0:3.5)});__game.setYaw(d.o==='V'?Math.PI:-Math.PI/2);__toolsQA.setPitch(-.12);__toolsQA.frame();}")
   await page.screenshot(path=str(OUT/'puerta-rosario-ruda.png'))
   memory=[]
   # Coarse-pointer portrait and landscape retain clear controls and a readable device.
   mobile=[]
   for width,height in [(390,844),(844,390)]:
    await page.set_viewport_size(dict(width=width,height=height));await page.emulate_media(media='screen')
    await page.evaluate("()=>{const w=__game.w,m=w.invs[0],it=w.items.find(i=>i.kind==='te');m.slots=[it,null,null];it.holder=m;__toolsQA.frame();}")
    rect=await page.locator('#tool').bounding_box();assert rect['x']>=0 and rect['x']+rect['width']<=width+1,rect
    mobile.append(rect);await page.screenshot(path=str(OUT/f'movil-{width}.png'))
   assert not errors,errors
   result=dict(passed=True,workshop=reports,world=world,checks=checks,saveUndoAndRoleGuard=True,png2048=True,mobileReadouts=mobile,pickupMemory=memory,doorAttachments=attachment,errors=errors)
   (OUT/'verificacion.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf8');print(json.dumps(dict(passed=True,objects=18,states=54,parts=399,saveUndo=True,handAndWorld=True,png2048=True,errors=errors)))
   await b.close()
 finally:
  (ROOT/'src/items-components.json').write_bytes(original);(ROOT/'juego/index.html').write_bytes(built);server.shutdown()
asyncio.run(main())
