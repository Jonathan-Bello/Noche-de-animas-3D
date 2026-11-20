"""Decoration controls on WebKit iPhone profiles; not a physical-device FPS test."""
import sys,asyncio,threading,functools,json,os
from pathlib import Path
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT.parent/'Editor_v20';OUT.mkdir(exist_ok=True)
sys.path.insert(0,str(ROOT.parent/'QA_Arte_Alex/python_lib'));os.environ.setdefault('PLAYWRIGHT_BROWSERS_PATH',str(ROOT.parent/'QA_Arte_Alex/browsers'))
from playwright.async_api import async_playwright
class Quiet(SimpleHTTPRequestHandler):
 def log_message(self,*a):pass
async def main():
 server=ThreadingHTTPServer(('127.0.0.1',8788),functools.partial(Quiet,directory=str(ROOT)));threading.Thread(target=server.serve_forever,daemon=True).start();reports=[]
 try:
  async with async_playwright()as p:
   browser=await p.webkit.launch()
   for device in ['iPhone 12','iPhone 12 landscape']:
    ctx=await browser.new_context(**{k:v for k,v in p.devices[device].items()if k!='default_browser_type'});page=await ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
    await page.route('**/three@*/build/three.module.js',lambda r:r.fulfill(path=str(ROOT/'test/three.module.js'),headers={'access-control-allow-origin':'*'},content_type='application/javascript'))
    await page.goto('http://127.0.0.1:8788/editor/');await page.wait_for_function('window.__decorMode&&__decorMode.objects.size>0');await page.fill('#catalog-search','mesa');await page.locator('.catalog-card').first.tap();await page.locator('#move-piece').tap();await page.wait_for_function('NDAEditor.placing');assert await page.locator('#scene-cancel').is_visible();await page.locator('#scene-cancel').tap();assert not await page.evaluate('NDAEditor.placing');assert await page.locator('#save').is_enabled();assert await page.locator('#save').inner_text()=='Publicar en el juego';assert await page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
    await page.evaluate("scrollTo(0,0)");await page.screenshot(path=str(OUT/('editor-iphone-horizontal.png'if'landscape'in device else'editor-iphone.png')),full_page=False);assert not errors,errors
    reports.append({'device':device,'selectionAndMoveCancel':True,'webExportMode':True,'noHorizontalOverflow':True,'errors':errors});await ctx.close()
   await browser.close();(OUT/'editor_mobile_validation.json').write_text(json.dumps({'passed':True,'profiles':reports,'note':'WebKit emulation, not physical iPhone GPU/FPS.'},indent=2),encoding='utf8');print(json.dumps({'passed':True,'profiles':2}))
 finally:server.shutdown()
asyncio.run(main())
