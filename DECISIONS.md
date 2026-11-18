# DECISIONS — Cache Me If You Can (کَشَم کن اگه می‌تونی)

Log of engineering/design decisions, per milestone, with rationale and measured outcomes.
Where `01_REQUIREMENTS.md` and `02_DESIGN.md` disagreed: design won on numbers/mechanics, requirements won on scope.

## M0–M1 — Skeleton & determinism
- **Single-file, zero-dep:** everything (HTML/CSS/JS/art/audio) inline in `index.html` (69 KB ≪ 600 KB target). No build step, works from `file://`. Verified: the only `http` string in the file is an inert share-URL fallback constant; no network request is ever made.
- **Seeded RNG:** `mulberry32` + `hash32` (FNV-style) for all gameplay randomness; daily seed = `hash32(parseInt(yyyymmdd_Tehran) ^ 0xC0FFEE)`.
- **Fixed timestep:** `DT = 1/60` with an accumulator capped at 5 steps/frame. Rendering interpolates nothing stateful — sim state IS render state — which makes snapshots trivially comparable.
- **Determinism test:** two identical 30 s runs (same seed, same scripted actions) produce byte-identical `snapshot()` JSON → **PASS**.
- **Never-crash policy:** `localStorage`, `AudioContext`, `matchMedia`, clipboard all guarded; missing APIs degrade to no-ops.

## M2–M3 — Sim core & balance loop
- Requests spawn on a timeline generated from the seed (rate ramps with `spawn.slope`); routing = nearest warm node else origin; hit roll = `hash32(seed ^ imul(reqId, 0x9E3779B1)) / 2^32 < warmth` → reproducible per-request outcomes.
- Headless bot harness via `window.__game` (newRun/step/applyAction/snapshot/placeNode/moveNode/applySwipe) so balance could be measured without a browser.

### Balance iterations (headless harness, survival seconds)
First six iterations used a provisional harness; the final two use bot policies implemented
**exactly per §14** (greedy: fixed city order + swipe-on-250u-approach; novice: random placement
with 1–3 s reaction delay, 35 % one-roll bot kill, occasional needless moves; lazy: no input).

| iter | policy set | change | lazy p50 | novice p50 | greedy p50 | verdict |
|---|---|---|---|---|---|---|
| 1–6 | provisional | spawn/patience/capacity/warmth sweep (see git history of this file) | 58→50 | >600→181 | >600→358 | harness mismatch suspected |
| 7 | §14-faithful | as-written config | 46.1 | 112.9 | 300.9 | novice 3 s over band |
| 8 | §14-faithful | `waves.first` 40→34, `waves.gapMin/Max` 32/42→28/36 (botLeak −7 tried, no effect, reverted) | **42.3** (p10 32 / p90 50) | **103.5** (p10 78 / p90 111) | **312.7** (p10 157 / p90 592) | ✅ all §14 targets met |

Targets (§14): lazy 25–50 s · novice 60–110 s · greedy ≥ 240 s p50 (and never < 150 s).
Final: 30 seeds/policy; 50-seed mixed soak passes all invariants (SLA∈[0,100], originInFlight ≥ 0,
no request older than patience+1 s, no NaN). Config deviations from the §3 starter table that were
needed to hit these targets: `spawn.slope` 0.05→0.07, `patience.min` 3.4→3.2, `sla.fastGain` 0.4→0.25,
`nodes.warmthGain` 0.10→0.07, wave cadence as above — each re-verified with the full §14 suite.

- **Score ranks rescaled** to the measured distribution (0 / 1 k / 5 k / 15 k / 40 k / 90 k): a first
run lands on rank 1–2, a strong greedy-level run reaches the top ranks.

## M4 — Input
- **Pointer Events** only (unified touch/mouse/pen); gesture state machine distinguishes tap (place), drag-from-node (move), and swipe-over-bots (kill wave) by travel distance + hit-tests. Tap slop 10 px, swipe min 24 px.
- Moving a node **resets its cache warmth** — the core strategic trade-off, kept from the design doc verbatim.
- Keyboard: `Space`/`P` pause. Tutorial clamps actions until steps complete.

## M5 — Rendering & feel
- **Two-layer canvas:** static layer (background gradient, Iran outline, city dots/labels, sea names) rendered once to an offscreen canvas; dynamic layer redrawn per frame (nodes as domes, packets, bots, particles, origin tower).
- **Perf:** no per-frame allocations in hot loops where avoidable; particle pool; DPR capped at 2. Held 60 fps in headless throttling tests on the 390×844 profile.
- All art procedural (paths/gradients) — original, palette-matched to ArvanCloud turquoise (#2BD9C7-ish) on deep navy.
- Verified visually at 390×844 (mobile) and 1280×720 (desktop): HUD, slot bar, map, portal label all inside safe areas; RTL text renders correctly.

## M6 — Audio & UI
- **WebAudio, Shur-scale** motifs for hit/miss/place/swipe/event; audio graph built lazily on first user gesture (autoplay-policy safe); mute persisted.
- DOM HUD/menus (not canvas text) for accessibility + crisp RTL Persian; Vazirmatn-if-installed else Tahoma fallback (no webfont fetch).
- Screens: menu, how-to, settings (language/sound), pause, game-over with rank + stats, share card.

## M7 — Share, daily, polish
- **Share card:** 1080×1350 canvas (story format) with score/rank/map snapshot; `navigator.share` → clipboard → download fallback chain, each in try/catch.
- **Daily challenge:** Tehran-date seed; one shared leaderboard-less brag card; `?seed=` override for testing.
- **Attract mode:** menu runs a silent demo sim behind the panels.
- **Debug:** `?debug=1` overlay (fps, sim counters, event log) + `window.__game` kept in production (harmless, useful for the jam judges).

## Known limitations / deliberate cuts
- No persistent leaderboard (out of scope for a single offline file).
- EN translation covers UI strings only; city names stay Persian on the map (art layer).
- Bots' "friendly fire" (swipe clipping your own node's warmth) kept — it is in the design doc and adds swipe discipline.

## How to re-verify
1. `node --check` on the extracted `<script>` → syntax OK.
2. Headless: run the three bot policies through `window.__game` (see README) → compare survival bands to the table above.
3. Browser: open `index.html?seed=42&notut=1`, play 60 s, check console clean; screenshot 390×844 & 1280×720.
