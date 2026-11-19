import asyncio, json, sys
from playwright.async_api import async_playwright
ROOT='http://localhost:8766'
SHIM=open('test/fakepeer.js').read()
async def page(ctx, name, errs):
    pg = await ctx.new_page()
    pg.on('pageerror', lambda e: errs.append(f'{name}: {e}'))
    pg.on('console', lambda m: errs.append(f'{name} console: {m.text}') if m.type=='error' and 'fonts' not in m.text and 'Failed to load resource' not in m.text else None)
    await pg.route('**/peerjs*', lambda r: r.fulfill(body=SHIM, content_type='application/javascript'))
    await pg.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    await pg.goto(ROOT+'/juego/index.html'); await pg.wait_for_timeout(700)
    return pg
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox','--disable-background-timer-throttling','--disable-renderer-backgrounding','--disable-backgrounding-occluded-windows'])
        ctx = await b.new_context(viewport={'width':1100,'height':700}); errs=[]
        h = await page(ctx,'host',errs); g = await page(ctx,'guest',errs)
        await h.evaluate("__game.menuOpt.tips='no'; __game.menuOpt.char='ines'; __game.menuOpt.nInv=3; __game.menuOpt.ghost='pena'")
        await h.fill('#onName','Anfi'); await h.click('#onHost'); await h.wait_for_timeout(400)
        code = await h.evaluate("__game.NET.code"); print('code', code)
        await g.evaluate("__game.menuOpt.char='rafael'; __game.menuOpt.tips='no'")
        await g.fill('#onName','Invi'); await g.fill('#onCode', code); await g.click('#onJoin'); await g.wait_for_timeout(800)
        print('lobby host', await h.inner_text('#onLobby'))
        print('status guest', await g.inner_text('#onStatus'))
        await h.click("#onStart"); await h.wait_for_timeout(600); await h.click("#slotGo"); await h.wait_for_timeout(1500); print("ERRS", errs[:5]); print(await h.evaluate("!!__game.w")); await h.screenshot(path="/tmp/host.png")
        info = await g.evaluate("(()=>{const w=__game.w; return {ME:__game.ME, n:w&&w.invs.length, names:w&&w.invs.map(i=>i.name+(i.bot?'(bot)':'')), ghost:w&&w.g.def.id, t:w&&w.t}})()")
        print('guest after start', json.dumps(info, ensure_ascii=False))
        # guest walks forward 3 s; host checks guest position
        p0 = await h.evaluate("(()=>{const i=__game.w.invs[1]; return [i.x,i.y]})()")
        await g.keyboard.down('w'); await g.wait_for_timeout(2500); await g.keyboard.up('w')
        await g.wait_for_timeout(400)
        p1 = await h.evaluate("(()=>{const i=__game.w.invs[1]; return [i.x,i.y,i.remote]})()")
        pg_ = await g.evaluate("(()=>{const i=__game.w.invs[__game.ME]; return [i.x,i.y]})()")
        print('guest pos on host', p0, '->', p1, 'guest local', pg_)
        # guest presses Q (light) and F (flashlight)
        await g.keyboard.press('f'); await g.wait_for_timeout(500)
        fl = await h.evaluate("__game.w.invs[1].flash"); print('flash toggled on host ->', fl)
        st = await g.evaluate("(()=>{const w=__game.w; return {t:w.t|0, ghostx:w.g.x.toFixed(1), items:w.items.length, log:w.log.slice(-3).map(l=>l.msg)}})()")
        sth = await h.evaluate("(()=>{const w=__game.w; return {t:w.t|0, ghostx:w.g.x.toFixed(1), items:w.items.length}})()")
        print('guest', json.dumps(st, ensure_ascii=False)); print('host ', json.dumps(sth))
        size = await h.evaluate("[JSON.stringify(netEnc(__game.w,true)).length, JSON.stringify(netEnc(__game.w,false)).length]"); print('snapshot bytes', size)
        await g.screenshot(path='/tmp/online_guest.png'); await h.screenshot(path='/tmp/online_host.png')
        # disconnect guest
        await g.close(); await h.wait_for_timeout(800)
        print('after guest left:', await h.evaluate("(()=>{const i=__game.w.invs[1]; return {escaped:i.escaped,left:i.left,slots:i.slots.filter(Boolean).length}})()"))
        print('ERRORS', len(errs)); [print(' ', e[:300]) for e in errs[:15]]
        await b.close()
asyncio.run(main())
