from playwright.sync_api import sync_playwright
from pathlib import Path
root=Path(__file__).resolve().parent.parent;out=root/'tests/screenshots/stage-current';out.mkdir(parents=True,exist_ok=True)
with sync_playwright() as p:
 b=p.chromium.launch()
 for w,h in [(390,844),(844,390),(1280,720)]:
  pg=b.new_page(viewport={'width':w,'height':h});errors=[];pg.on('pageerror',lambda e:errors.append(str(e)));pg.goto((root/'index.html').as_uri()+'?notut=1');pg.wait_for_timeout(1500);pg.evaluate('window.__game.DB.campaignUnlocked=7');pg.click('#btnCampaign');buttons=pg.locator('#campaignChoices button');assert buttons.count()==8 and buttons.nth(7).is_disabled();buttons.nth(7).scroll_into_view_if_needed();pg.screenshot(path=str(out/f'{w}x{h}-campaign-locked.png'));buttons.nth(6).click();pg.evaluate("window.__game.state.t=134.99;window.__game.state.nextArrival=999;window.__game.state.sla=100");pg.wait_for_selector('#ovOver.show');assert 'کامل شد' in pg.locator('#overTitle').inner_text();pg.screenshot(path=str(out/f'{w}x{h}-campaign-victory.png'));pg.click('#btnOverMenu');pg.click('#btnCampaign');buttons=pg.locator('#campaignChoices button');assert not buttons.nth(7).is_disabled();buttons.nth(7).scroll_into_view_if_needed();pg.screenshot(path=str(out/f'{w}x{h}-campaign-unlocked.png'));pg.reload();pg.wait_for_timeout(1000);pg.click('#btnCampaign');assert not pg.locator('#campaignChoices button').nth(7).is_disabled();assert not errors,errors;print(w,h,'campaign unlock PASS');pg.close()
 b.close()
