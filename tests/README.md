# Tests

## Headless (no browser) — one command

```bash
node tests/run_all.js        # exits non-zero on any failure
```

Suites inside `tests/balance_harness.js`:
1. **determinism** — same seed + same action log twice ⇒ identical `snapshot()` JSON.
2. **reroute invariant** — after `moveNode` / outage event / bot leak (attack): no non-done request references a node with `state !== 'online'`.
3. **menu-loop smoke** — `startRun → toMenu → 300 loop frames` ⇒ zero exceptions (`__game.loopErrors === 0`), attract mode steps its own state.
4. **tutorial completion** — simulated 100 s ⇒ `DB.tutorialSeen === true`.
5. **tray labels** — locked slots show ۲۵ث / ۵۵ث / ۹۵ث at t=0.
6. **warmth ring geometry** — recording-ctx: ring arc center within 30 px of the node dome.
7. **swipe radii** — pixel-radius semantics: on-line swipe kills, far-off swipe misses (explicit world radii keep this deterministic).
8. **difficulty bands** (30 seeds/policy, p50): lazy 25–50 s · novice 60–110 s · human 90–180 s · greedy ≥240 s (p10 ≥150) · expert ≥240 s. Prints p10/p50/p90 survival+score for lazy/novice/human/expert/greedy.
9. **soak** — 50 seeds × up to 600 s, invariants: SLA∈[0,100], originInFlight ≥ 0, no NaN.

Bot policies follow `02_DESIGN.md §14` (lazy/novice/greedy) plus human-like ones:
`human` (0.5–1.0 s reaction, ±14 px aim error, 25 % whiffs, 8 % careless swipes, 2–4 s placement)
and `expert` (0.3–0.6 s reaction, ±14 px error + ±4 px retry, 5 % whiffs, panic-swipe inside 60 u, 1–2 s placement).
Policy randomness is seeded per (seed, policy) so runs are reproducible.

## Visual (Playwright, optional)

```bash
pip install playwright && python -m playwright install chromium
python3 tests/visual_qa.py [outdir]     # default tests/screenshots
```

Captures menu / play-with-wave / pause / game-over / how-to at 390×844, 360×740, 320×568,
844×390, 1280×720, 1920×1080 plus the 1080×1350 share card, prints map metrics per viewport
and any page errors. A representative subset of outputs is committed in `tests/screenshots/`.
