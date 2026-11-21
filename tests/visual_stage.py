from playwright.sync_api import sync_playwright
from pathlib import Path
ROOT=Path(__file__).resolve().parent.parent
url=(ROOT/'index.html').as_uri()+'?seed=42&notut=1'
out=ROOT/'tests/screenshots/stage-current';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in [(320,568),(360,740),(390,844),(412,915),(844,390),(1280,720),(1920,1080)]:
  pg=b.new_page(viewport={'width':w,'height':h});errs=[];pg.on('pageerror',lambda e:errs.append(str(e)))
  pg.goto(url);pg.wait_for_timeout(1200);pg.screenshot(path=str(out/f'{w}x{h}-menu.png'))
  pg.click('#btnLocalBoard');pg.wait_for_timeout(100);assert pg.locator('#ovLocalBoard').is_visible();assert 'همین دستگاه' in pg.locator('#ovLocalBoard').inner_text();
  if w==390: pg.screenshot(path=str(out/'390x844-local-board.png'))
  pg.click('#btnLocalBack');pg.click('#btnPlay');pg.wait_for_timeout(1800);pg.evaluate("window.__game.applyAction({type:'place',city:0});window.__game.applyAction({type:'place',city:1})");pg.wait_for_timeout(200);pg.screenshot(path=str(out/f'{w}x{h}-play.png'));bounds=pg.evaluate('window.__game.mapBounds');
  if w==390 and h==844: print('390x844 outline',bounds);assert bounds['width']>=w*.90 and bounds['height']>=h*.62
  assert not errs,errs;print(w,h,'PASS')
  pg.close()
 b.close()
