from playwright.sync_api import sync_playwright
from pathlib import Path
import base64
root=Path(__file__).resolve().parent.parent; out=root/'tests/screenshots/stage-current';out.mkdir(parents=True,exist_ok=True); samples=root/'assets/share_samples';samples.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in [(390,844),(844,390),(1280,720)]:
  pg=b.new_page(viewport={'width':w,'height':h});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.goto((root/'index.html').as_uri()+'?seed=42&notut=1');pg.wait_for_timeout(700)
  for mode in ['endless','daily','campaign']:
   pg.evaluate("mode=>{let G=window.__game;G.startRun(mode,mode==='daily'?42:undefined,false,mode==='daily'?'20261118':undefined,mode==='campaign'?1:undefined);let s=G.state;G.placeNode(0);G.placeNode(2);s.turboCount=2;s.goldenCount=3;s.score=123456;s.sla=0;s.t=70;s.nextArrival=999}",mode)
   pg.wait_for_selector('#ovSecondChance.show');pg.click('#btnFinishRun');pg.wait_for_selector('#ovOver.show');pg.click('#btnShare');pg.wait_for_function("!document.querySelector('#saveImage').disabled");pg.screenshot(path=str(out/f'{w}x{h}-share-{mode}.png'))
   if w==390:
    data=pg.evaluate("window.__game.renderShareCard(window.__game.state).toDataURL('image/png').split(',')[1]");(samples/(mode+'.png')).write_bytes(base64.b64decode(data))
    txt=pg.evaluate('window.__game.shareText()');assert txt.startswith('🛕 کَشَم کن اگه می‌تونی\n') and '#GameOnEdge' in txt
   pg.click('#closeShare')
  assert not errors,errors;print(w,h,'share modes PASS');pg.close()
 b.close()
