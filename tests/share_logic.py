from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parent.parent
with sync_playwright() as p:
 b=p.chromium.launch();pg=b.new_page();errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.goto((root/'index.html').as_uri()+'?notut=1');pg.wait_for_timeout(1600)
 pg.evaluate("""()=>{let g=window.__game;g.startRun('endless');let s=g.state;s.sla=0;s.t=15;s.nextArrival=999;window.shares=[];window.copies=[];Object.defineProperty(navigator,'clipboard',{value:{writeText:t=>{copies.push(t);return Promise.resolve()}},configurable:true});Object.defineProperty(navigator,'share',{value:d=>{shares.push(d);return window.cancelShare?Promise.reject(Object.assign(Error(),{name:'AbortError'})):Promise.resolve()},configurable:true});Object.defineProperty(navigator,'canShare',{value:()=>true,configurable:true})}""");pg.wait_for_selector('#ovSecondChance.show');pg.click('#btnFinishRun');pg.click('#btnShare');pg.wait_for_function("!document.querySelector('#shareImage').disabled");pg.click('#shareImage');pg.click('#shareText');assert pg.evaluate('shares.length')==2
 pg.evaluate("window.cancelShare=true");pg.click('#shareImage');pg.click('#shareText');pg.wait_for_timeout(100);assert pg.evaluate('copies.length')==0
 pg.evaluate("Object.defineProperty(navigator,'canShare',{value:()=>false,configurable:true})");
 with pg.expect_download() as dl: pg.click('#shareImage')
 assert dl.value.suggested_filename=='cache-me.png'
 pg.evaluate("Object.defineProperty(navigator,'share',{value:undefined,configurable:true})");pg.click('#shareText');pg.wait_for_function('copies.length===1');assert pg.evaluate("copies[0].includes('می‌تونی ازم جلو بزنی؟')")
 assert not errors,errors;print('PASS mocked navigator image/text share, cancel no fallback, unsupported text copy');b.close()
