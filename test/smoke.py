import asyncio, json, sys
from playwright.async_api import async_playwright
async def run(b, role, ghost, secs, errs, shots, cam='hombro', char='ines'):
    pg = await b.new_page(viewport={'width':1280,'height':800})
    pg.on('pageerror', lambda e: errs.append(f'{role}: {e}'))
    pg.on('console', lambda m: errs.append(f'{role} console: {m.text}') if m.type=='error' else None)
    await pg.goto('http://localhost:8766/juego/index.html'); await pg.wait_for_timeout(800)
    await pg.evaluate(f"__game.menuOpt.role='{role}'; __game.menuOpt.ghost='{ghost}'; __game.menuOpt.nInv=3; __game.menuOpt.cam='{cam}'; __game.menuOpt.char='{char}'; __game.menuOpt.tips='no';")
    await pg.click('#play'); await pg.wait_for_timeout(600); await (pg.click('#slotGo') if await pg.query_selector('#slotGo') else pg.wait_for_timeout(1)); await pg.wait_for_timeout(1200)
    for k in range(secs):
        await pg.evaluate("(()=>{const w=__game.w; if(!w||w.over) return; for(let i=0;i<10;i++) __game.step(w,0.1,{mx:Math.sin(w.t*0.3),my:Math.cos(w.t*0.21),sprint:false,press:new Set(['e',' ','g','q','f','c','v','x','1','2','3'].filter(()=>Math.random()<0.04))});})()")
        await pg.wait_for_timeout(40)
        if k in shots: await pg.screenshot(path=f'/tmp/play_{role}_{k}.png')
    st = await pg.evaluate("(()=>{const w=__game.w; return {t:w.t|0, over:w.over, phase:w.phase, conf:Object.keys(w.conf), obs:Object.keys(w.obs), deaths:w.stats.deaths, hunts:w.stats.hunts, g:w.g.state, pres:w.g.pres|0}})()")
    await pg.close(); return st
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--no-sandbox'])
        errs=[]
        for role,ghost,cam in [('inv','random','hombro'),('ghost','llorona','hombro'),('bots','random','hombro')]:
            st = await run(b, role, ghost, 25, errs, {3,20}, cam)
            print(role, ghost, cam, json.dumps(st))
        print('ERRORS', len(errs)); [print(' ', e[:300]) for e in errs[:15]]
        await b.close()
asyncio.run(main())
