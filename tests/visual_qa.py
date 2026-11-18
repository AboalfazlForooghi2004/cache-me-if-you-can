"""Visual QA matrix for "Cache Me If You Can".
Usage: pip install playwright && python -m playwright install chromium
       python3 tests/visual_qa.py [outdir]
Captures menu / play-with-wave / pause / game-over / how-to at six viewports,
plus the 1080x1350 share card, and prints layout metrics (map size, HUD heights)
and any page errors. Screenshots land in <outdir> (default tests/screenshots)."""
import pathlib, sys, base64
from playwright.sync_api import sync_playwright

URL = (pathlib.Path(__file__).resolve().parent.parent / 'index.html').as_uri() + '?seed=42&notut=1'
OUT = pathlib.Path(sys.argv[1] if len(sys.argv) > 1 else pathlib.Path(__file__).resolve().parent / 'screenshots')
OUT.mkdir(parents=True, exist_ok=True)
VIEWPORTS = [(390, 844), (360, 740), (320, 568), (844, 390), (1280, 720), (1920, 1080)]
metrics, errors = [], []

with sync_playwright() as pw:
    b = pw.chromium.launch()
    for (w, h) in VIEWPORTS:
        pg = b.new_page(viewport={'width': w, 'height': h})
        pg.on('pageerror', lambda e: errors.append(str(e)))
        tag = f'{w}x{h}'
        pg.goto(URL); pg.wait_for_timeout(1400)
        pg.screenshot(path=str(OUT / f'{tag}_menu.png'))
        if w == 390:
            print('font Vazirmatn loaded:', pg.evaluate("document.fonts ? document.fonts.check('400 12px Vazirmatn') && document.fonts.check('700 12px Vazirmatn') : 'no FontFaceSet'"))
        pg.click('#btnPlay'); pg.wait_for_timeout(1800)
        pg.evaluate("window.__game.applyAction({type:'place',city:0});window.__game.applyAction({type:'place',city:1})")
        pg.wait_for_function("window.__game.state.activeWave!==null", timeout=90000)
        pg.wait_for_timeout(2200)
        pg.screenshot(path=str(OUT / f'{tag}_play_wave.png'))
        m = pg.evaluate("(()=>{const g=window.__game;return {mapScale:+g.mapScale.toFixed(3)}})()")
        mw, mh = m['mapScale'] * 1000, m['mapScale'] * 892
        metrics.append(f'{tag}: map {mw:.0f}x{mh:.0f}px')
        pg.keyboard.press(' '); pg.wait_for_timeout(500)   # Space pauses (item 16)
        pg.screenshot(path=str(OUT / f'{tag}_pause.png'))
        pg.click('#btnToMenu'); pg.wait_for_timeout(600)
        pg.click('#btnHow'); pg.wait_for_timeout(400)
        pg.screenshot(path=str(OUT / f'{tag}_howto.png'))
        pg.click('#btnHowBack'); pg.wait_for_timeout(300)
        # game over: fresh no-input run
        pg.click('#btnPlay'); pg.wait_for_selector('#ovOver.show', timeout=150000)
        pg.wait_for_timeout(400)
        pg.screenshot(path=str(OUT / f'{tag}_gameover.png'))
        if (w, h) == (390, 844):
            data = pg.evaluate("buildShareCard().toDataURL('image/png')")
            (OUT / 'share_card_1080x1350.png').write_bytes(base64.b64decode(data.split(',', 1)[1]))
        pg.close()
    b.close()

print('\n'.join(metrics))
print('page errors:', errors if errors else 'none')
print('screenshots in', OUT)
