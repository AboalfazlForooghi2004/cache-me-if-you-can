from pathlib import Path
import json
from playwright.sync_api import sync_playwright
root=Path(__file__).resolve().parent.parent;html=(root/'index.html').read_text();calls=[];failure=False
def hash32(x):
 x&=0xffffffff;x=((x^(x>>16))*0x45d9f3b)&0xffffffff;x=((x^(x>>16))*0x45d9f3b)&0xffffffff;return (x^(x>>16))&0xffffffff
with sync_playwright() as p:
 b=p.chromium.launch();pg=b.new_page(viewport={'width':390,'height':844});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)))
 def route(r):
  url=r.request.url;path=url.split('?')[0];calls.append((url,r.request.method))
  if path.endswith('/api/ping'):r.fulfill(status=200,json={'ok':True,'online':True,'t':1})
  elif failure and '/api/' in path:r.fulfill(status=503,json={'ok':False})
  elif path.endswith('/api/start'):
   body=r.request.post_data_json or {};r.fulfill(status=200,json={'ok':True,'date':'20261101','seed':hash32(20261101^0xC0FFEE),'token':'test-token','validation':'LITE','challenge':'challenge' in body})
  elif path.endswith('/api/score'):r.fulfill(status=200,json={'ok':True,'validation':'LITE'})
  elif path.endswith('/api/challenge'):r.fulfill(status=200,json={'ok':True,'url':'https://game.test/?challenge=abc.def'})
  elif path.endswith('/api/leaderboard'):r.fulfill(status=200,json={'ok':True,'validation':'LITE','entries':[{'name':'ابرک','score':999},{'name':'<img>','score':1}]})
  else:r.fulfill(status=200,content_type='text/html',body=html)
 pg.route('https://game.test/**',route);pg.goto('https://game.test/?daily=20261101&notut=1');pg.wait_for_timeout(1400)
 pg.click('#btnOnlineBoard');pg.wait_for_function("document.querySelector('#onlineBoardRows').textContent.includes('ابرک')");assert 'ناشناس' in pg.locator('#onlineBoardRows').inner_text();assert pg.locator('#onlineBoardRows img').count()==0;pg.screenshot(path=str(root/'tests/screenshots/stage-current/390x844-online-board-mock.png'));pg.click('#btnOnlineBack')
 pg.click('#btnDaily');pg.check('#onlineConsent');pg.click('#btnDailyStart');pg.wait_for_function("window.__game.state && window.__game.state.onlineTicket==='test-token'")
 pg.evaluate("window.__game.state.sla=0;window.__game.state.t=15;window.__game.state.nextArrival=999");pg.wait_for_selector('#ovSecondChance.show');pg.click('#btnFinishRun');pg.wait_for_function("document.querySelector('#onlineStatus').textContent.includes('ثبت آنلاین شد')");assert any('/api/score' in u for u,m in calls)
 pg.click('#btnChallengeLink');pg.wait_for_selector('#ovShareText.show');assert 'challenge=abc.def' in pg.locator('#shareTa').input_value();pg.click('#btnShareTaClose')
 pg.goto('https://game.test/?challenge=abc.def&daily=20261101&notut=1');pg.wait_for_timeout(1400);pg.click('#btnFriendBoard');pg.wait_for_function("document.querySelector('#onlineBoardRows').textContent.includes('ابرک')");assert any('/api/leaderboard?challenge=abc.def' in u for u,m in calls);pg.click('#btnOnlineBack');pg.click('#btnFriendChallenge');pg.click('#btnDailyStart');assert 'اجازه' in pg.locator('#dailyStartMessage').inner_text();pg.check('#onlineConsent');pg.click('#btnDailyStart');pg.wait_for_function("window.__game.state && window.__game.state.challengeToken==='abc.def'")
 pg.evaluate("window.__game.state.sla=0;window.__game.state.t=15;window.__game.state.nextArrival=999");pg.wait_for_selector('#ovSecondChance.show');pg.click('#btnFinishRun');pg.wait_for_function("document.querySelector('#onlineStatus').textContent.includes('ثبت آنلاین شد')");assert pg.evaluate("window.__game.DB.daily['20261101'].runs===1")
 failure=True;pg.goto('https://game.test/?daily=20261101&notut=1');pg.wait_for_timeout(1400);pg.click('#btnOnlineBoard');pg.wait_for_function("document.querySelector('#onlineBoardRows').textContent.includes('در دسترس نیست')");pg.click('#btnOnlineBack');pg.click('#btnDaily');pg.check('#onlineConsent');pg.click('#btnDailyStart');pg.wait_for_function("window.__game.state && window.__game.state.mode==='daily'");assert pg.evaluate("!window.__game.state.onlineTicket")
 assert not errors,errors;print('PASS mocked online consent, challenge creation/join, separate board, sanitized records and offline fallback');b.close()
