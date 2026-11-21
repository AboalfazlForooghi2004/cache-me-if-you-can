from pathlib import Path
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent;html=(root/'index.html').read_text();out=root/'tests/screenshots/stage-current';out.mkdir(parents=True,exist_ok=True)
def hash32(x):
 x&=0xffffffff;x=((x^(x>>16))*0x45d9f3b)&0xffffffff;x=((x^(x>>16))*0x45d9f3b)&0xffffffff;return (x^(x>>16))&0xffffffff
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in [(390,844),(320,568),(844,390),(1280,720)]:
  pg=b.new_page(viewport={'width':w,'height':h});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));online=[True];fail=[False];calls=[]
  def route(r):
   url=r.request.url;path=url.split('?')[0];calls.append(url)
   if path.endswith('/api/ping'):r.fulfill(json={'ok':True,'online':online[0],'t':1})
   elif fail[0] and '/api/' in path:r.fulfill(status=503,json={'ok':False})
   elif path.endswith('/api/start'):r.fulfill(json={'ok':True,'date':'20261101','seed':hash32(20261101^0xC0FFEE),'token':'test-token','challenge':True})
   elif path.endswith('/api/score'):r.fulfill(json={'ok':True,'id':'my-id'})
   elif path.endswith('/api/leaderboard'):r.fulfill(json={'ok':True,'date':'20261101','entries':[{'name':'ابرک','score':20000-i*100,'id':'my-id' if i==10 else str(i)} for i in range(15)]})
   else:r.fulfill(content_type='text/html',body=html)
  pg.route('https://game.test/**',route);pg.goto('https://game.test/?daily=20261101&notut=1');pg.wait_for_function("getComputedStyle(document.querySelector('#btnOnlineBoard')).display!=='none'");pg.screenshot(path=str(out/f'{w}x{h}-menu-online-mock.png'))
  pg.click('#btnDaily');assert pg.locator('#onlineConsent').count()==0;pg.screenshot(path=str(out/f'{w}x{h}-daily-intro-online-mock.png'));pg.click('#btnDailyStart');pg.wait_for_function("window.__game.state && window.__game.state.onlineTicket==='test-token'")
  pg.evaluate("window.__game.state.sla=0;window.__game.state.t=15;window.__game.state.nextArrival=999");pg.wait_for_selector('#ovSecondChance.show');pg.click('#btnFinishRun');pg.wait_for_selector('#ovName.show');pg.screenshot(path=str(out/f'{w}x{h}-name-mock.png'));pg.click('#btnRandomName');assert len(pg.locator('#scoreName').input_value())>=3;pg.click('#btnSubmitScore');pg.wait_for_selector('.boardrow.own');assert pg.locator('.boardrow').count()==15;assert '۱۱' in pg.locator('#onlineRank').inner_text();pg.screenshot(path=str(out/f'{w}x{h}-board-own-mock.png'));pg.click('#btnOnlineBack');pg.wait_for_selector('#ovOver.show');pg.screenshot(path=str(out/f'{w}x{h}-game-over-mock.png'))
  online[0]=False;pg.goto('https://game.test/?daily=20261101&notut=1');pg.wait_for_timeout(300);assert pg.locator('#btnOnlineBoard').is_hidden();pg.screenshot(path=str(out/f'{w}x{h}-menu-offline.png'));pg.click('#btnDaily');assert pg.locator('#onlineOptions').is_hidden();pg.click('#btnDailyStart');assert not pg.evaluate('window.__game.state.onlineTicket');assert not errors,errors;print(w,h,'mock flows PASS');pg.close()
 b.close()
