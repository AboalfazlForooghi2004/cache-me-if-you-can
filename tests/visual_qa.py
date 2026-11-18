"""Visual QA: screenshots of every screen at mobile + desktop viewports.
Usage: pip install playwright && python -m playwright install chromium && python3 tests/visual_qa.py [outdir]"""
import pathlib, sys
from playwright.sync_api import sync_playwright
URL = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri() + '?seed=42&notut=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else '/tmp/qa'); OUT.mkdir(parents=True, exist_ok=True)
with sync_playwright() as pw:
    b = pw.chromium.launch(); errs = []
    pg = b.new_page(viewport={'width': 390, 'height': 844})
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.goto(URL); pg.wait_for_timeout(1200); pg.screenshot(path=str(OUT/'menu_mobile.png'))
    pg.click('#btnPlay'); pg.wait_for_timeout(2000)
    pg.evaluate("window.__game.applyAction({type:'place',city:0});window.__game.applyAction({type:'place',city:1})")
    pg.wait_for_timeout(4000); pg.screenshot(path=str(OUT/'play_mobile.png'))
    pg.wait_for_function("window.__game.state.activeWave!==null", timeout=60000)
    pg.wait_for_timeout(2500); pg.screenshot(path=str(OUT/'wave_mobile.png'))
    pg.keyboard.press('Space'); pg.wait_for_timeout(400); pg.screenshot(path=str(OUT/'pause_mobile.png'))
    pg.keyboard.press('Space'); pg.wait_for_selector('#ovOver.show', timeout=120000)
    pg.screenshot(path=str(OUT/'gameover_mobile.png'))
    pg2 = b.new_page(viewport={'width': 1280, 'height': 720})
    pg2.on('pageerror', lambda e: errs.append(str(e)))
    pg2.goto(URL); pg2.wait_for_timeout(1000); pg2.click('#btnPlay'); pg2.wait_for_timeout(1500)
    pg2.evaluate("window.__game.applyAction({type:'place',city:0});window.__game.applyAction({type:'place',city:1});window.__game.applyAction({type:'place',city:2})")
    pg2.wait_for_timeout(5000); pg2.screenshot(path=str(OUT/'play_desktop.png'))
    print('screenshots in', OUT, '| page errors:', errs if errs else 'none')
    b.close()
