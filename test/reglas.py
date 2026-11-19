import asyncio, json
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox'])
        pg = await b.new_page(viewport={'width':1100,'height':700}); errs=[]
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: '+m.text) if m.type=='error' and 'Failed to load' not in m.text else None)
        await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
        await pg.goto('http://localhost:8766/juego/index.html'); await pg.wait_for_timeout(700)
        await pg.evaluate("localStorage.setItem('nda_dinero','200'); __game.menuOpt.tips='no'; __game.menuOpt.ghost='llorona'; __game.menuOpt.nInv=2")
        await pg.click('#play'); await pg.wait_for_timeout(600)
        await pg.screenshot(path='/tmp/v_slot.png')
        await pg.click('#spinAll'); await pg.wait_for_timeout(200)
        print('wallet after spin', await pg.evaluate("localStorage.getItem('nda_dinero')"))
        await pg.click('#slotGo'); await pg.wait_for_timeout(1500)
        await pg.screenshot(path='/tmp/v_ruleta.png')
        try: await pg.click('#ruleta button', timeout=1000)
        except Exception: pass
        info = await pg.evaluate("(()=>{const w=__game.w; return {mods:w.mods, limit:w.lightLimit, slots:w.invs[0].slots.length, obj:w.obj.map(o=>o.k), voice:w.g.voice, cams:w.items.filter(i=>i.kind==='fotocam').length}})()")
        print(json.dumps(info, ensure_ascii=False))
        # casona events, one by one, rendered
        for k in ['tv','senuelo','cadaver','rezando','sombra','telefono','tvcam','barras','ambiente','zaguan','pasos','puerta','clima']:
            await pg.evaluate(f"(()=>{{const w=__game.w; const v=w.invs[0]; casDo(w,'{k}',v);}})()")
            await pg.wait_for_timeout(250)
        await pg.evaluate("(()=>{const w=__game.w; const v=w.invs[0]; v.x=21; v.y=36; v.face=-1.57; casDo(w,'cadaver',v); casDo(w,'senuelo',v);})()")
        await pg.wait_for_timeout(600); await pg.screenshot(path='/tmp/v_cas.png')
        # take a photo with the instant camera
        await pg.evaluate("(()=>{const w=__game.w, me=w.invs[0]; const cam=w.items.find(i=>i.kind==='fotocam'); cam.holder=me; me.slots[0]=cam; me.hand=0; w.g.f=me.f; w.g.x=me.x; w.g.y=me.y-3; w.g.revealUntil=w.t+5; me.face=-Math.PI/2;})()")
        await pg.keyboard.press(' '); await pg.wait_for_timeout(500)
        print('photos', await pg.evaluate("JSON.stringify(__game.w.photos)"))
        # light limit
        r = await pg.evaluate("(()=>{const w=__game.w; for(let f=0;f<2;f++) for(let r=0;r<w.lights[f].length;r++) if(!isHall(f,r)) w.lights[f][r]=1; const me=w.invs[0]; const sw=SWITCHES[0].find(Boolean); w.lights[sw.f][sw.r]=0; me.f=sw.f; me.x=sw.x; me.y=sw.y; toggleLight(w,me); return {fuse:w.fuse, lit:litCount(w)}})()")
        print('light limit', r)
        # journal guess + exit
        await pg.keyboard.press('Tab'); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelector('.cand[data-g=\\'llorona\\'] span').click()"); await pg.wait_for_timeout(200)
        await pg.evaluate("document.querySelector('[data-guess=\\'llorona\\']').click()"); await pg.wait_for_timeout(200)
        await pg.screenshot(path='/tmp/v_journal.png')
        await pg.keyboard.press('Tab')
        await pg.evaluate("(()=>{const w=__game.w, me=w.invs[0]; me.f=EXIT.f; me.x=EXIT.x; me.y=EXIT.y-0.6; w.cas.knock=null; w.invs[1].alive=false;})()")
        await pg.keyboard.press('e'); await pg.wait_for_timeout(300); await pg.keyboard.press('e'); await pg.wait_for_timeout(1500)
        end = await pg.evaluate("(()=>{const o=__game.w.over; return o && {win:o.win, cause:o.cause, res:o.res}})()")
        print('END', json.dumps(end, ensure_ascii=False)); print('wallet', await pg.evaluate("localStorage.getItem('nda_dinero')"))
        await pg.screenshot(path='/tmp/v_end.png')
        print('ERRORS', len(errs)); [print(' ', e[:300]) for e in errs[:12]]
        await b.close()
asyncio.run(main())
