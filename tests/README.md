# Tests

- `balance_harness.js` — headless bot policies per design §14 (lazy/novice/greedy) + 50-seed soak + invariants.
  Run: `node tests/balance_harness.js` (no browser needed; stubs DOM globals and evals the game script).
  Expected bands: lazy 25–50 s · novice 60–110 s · greedy ≥ 240 s (p50).
- `visual_qa.py` — Playwright screenshots of menu / play / wave / pause / game-over at 390×844 and 1280×720.
  Run: `pip install playwright && python -m playwright install chromium && python3 tests/visual_qa.py [outdir]`
