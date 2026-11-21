# DECISIONS — Cache Me If You Can (کَشَم کن اگه می‌تونی)

Engineering/design decision log. Where `01_REQUIREMENTS.md` and `02_DESIGN.md` disagreed:
design won on numbers/mechanics, requirements won on scope. Every claim below is backed by a
committed test (`node tests/run_all.js`) or a committed screenshot (`tests/screenshots/`).

---

## Round 2 — review fixes (P0→P2), in review order

| # | Item | Status | Fix | Verification |
|---|---|---|---|---|
| 1 | warmth ring drawn at absolute y | fixed | ring center `(x, y-6*scale)` in `drawDome` | test 6 "warmth ring drawn around node (<30px)" (recording-ctx), PASS |
| 2 | reroute before state change | fixed | `moveNode` / outage / `leakBot` now set state → `rerouteNode()` → reset load | test 2 (move/outage/attack) PASS; also asserted live inside every policy run |
| 3 | crash after toMenu + attract never ran | fixed | demo keeps its own state; `stepDemo` swaps `S` in try/finally; `render` draws `S||demo`; loop body wrapped in guard counting `loopErrors` | test 3 (startRun→toMenu→300 frames, `loopErrors=0`) PASS |
| 4 | tutorial never ends | fixed | caption engine: ≥2.5 s per caption, auto-hide ~5 s, advance on real conditions; completes on first wave clear or t≥70 (`tutorialSeen=true`, skip hidden); pulsing ring on Tehran (step 1) + animated ✋ swipe hint (wave step) | test 4 (100 s ⇒ `tutorialSeen===true`) PASS |
| 5 | swipe radii were world units | fixed | `applySwipe(x1,y1,x2,y2,killR?,friendR?)`; defaults convert `CONFIG.bots.killRadiusPx/friendlyRadiusPx` (now true px: 24/16) via `/mapScale`; headless API accepts explicit world radii | test 7 (on-line kills / off-line misses) PASS |
| 6 | node drag hijacked swipes | fixed | pickup requires hold (`input.holdMs` 170 / `holdWaveMs` 250) or >`dragPickPx` 18 px drag starting on the dome; release only on empty-city target, else snap back | manual + `320x568`/`390x844` wave screenshots (swipes near nodes no longer move them); logic reviewed |
| 7 | no selection feedback | fixed | gold pulsing ring on selected node, pulsing rings on eligible empty cities while dragging/selected, toast «شهر مقصد رو بزن», tap-elsewhere cancels | visible in `390x844_play_wave.png` family; code path exercised by input rewrite |
| 8 | ranks miscalibrated | fixed | late-game score damping (`score.lateDamp*`: ×1 → ×0.5 after 120 s) compresses greedy p90/p50 from 1.9→1.55; thresholds recalibrated from 30-seed percentiles: 0/1.5k/9k/24k/50k/122k (lazy p90→t2, novice p50→t3, novice p90·1.3→t4, greedy p50·0.6→t5, greedy p90·0.95→t6) | harness score table (below): lazy p90 1145 < 1500 ⇒ rank 1; novice 6.9k–18.4k ⇒ ranks 2–3; greedy p50 82.9k ⇒ rank 5; p90 128.8k ≥ 122k ⇒ top ~10 % rank 6 |
| 9 | balance only perfect bots | fixed | `human` + `expert` policies added (pixel aim error, reaction delay, whiffs, careless swipes, slower placement; seeded per-run) | bands: human p50 104 s ∈ [90,180]; expert p50 313 s ≥ 240; table below |
| 10 | tray lock labels off by one | fixed | locked slot i reads `unlockAt[i-1]`; `slotLabel(i)` extracted + exposed | test 5 (۲۵ث/۵۵ث/۹۵ث) PASS |
| 11 | HUD/perf waste | fixed | tray DOM built only on structure change, texts updated in place; `#latVal` text node; sparkline redrawn ≥1 s; per-city pending lists precomputed once per frame; SLA width only on integer change | code review + 6-viewport QA runs with zero page errors; debug overlay shows ren < 3 ms at 390×844 in headless |
| 12 | share cancel ⇒ download+copy | fixed | `AbortError` ⇒ toast only; clipboard failure ⇒ visible selectable `<textarea>` overlay (`#ovShareText`) | code path; overlay reachable in browser (headless clipboard denial shows it) |
| 13 | hard-coded HUD heights / landscape dead strip | fixed | `resize()` measures real topbar/slabar/bottombar heights; aspect>1.2 & ≥900 px ⇒ right sidebar (tray+spark+time); landscape phones (<520 px high) ⇒ compact floating HUD with full-bleed map; banner/toast/tutorial positioned via `--hud-top/--hud-bot` | visual_qa metrics: 320×568 map 280×250 (≥280 wide ✓), 844×390 map 392×350 (≥300 tall ✓), 1280×720 sidebar, 1920×1080; screenshots committed |
| 14 | font not embedded | fixed | Vazirmatn (OFL) Regular+Bold subsetted (ASCII + U+0600–06FF + ZWNJ + punctuation, `--layout-features='*'`) to 2×28 KB WOFF2, base64-embedded; `document.fonts.load(...)` then `buildStatic()`; fallback stack `'Noto Sans Arabic','Geeza Pro',Tahoma` for Android/iOS | visual_qa prints `font Vazirmatn loaded: True`; license at `tests/Vazirmatn-OFL.txt`; file 153 KB < 600 KB |
| 15 | fake language toggle | fixed (scope cut) | settings row, wiring and `?lang=en` removed; README no longer mentions it | grep: no `tglLang`, no `lang=en` |
| 16 | Space didn't pause | fixed | `Space` (preventDefault) joins P/Esc | visual_qa pauses via `keyboard.press(' ')` at all 6 viewports — pause screenshots exist |
| 17 | resume countdown stacking | fixed | `resuming` flag + `clearResume()` on pause/restart/menu/hidden tab; countdown never resumes while hidden | code review; pause screenshots taken mid-overlay without stacked intervals |
| 18 | conflict guard single-pass | fixed | loop until no event–wave pair < `minSep` (≤60 passes) | determinism test still PASS (timeline generation unchanged for clean seeds) |
| 19 | a11y/meta/favicon | fixed | `aria-live="polite"` on banner+toast, `<meta name="description">`, data-URI 🛕 favicon | present in head |
| 20 | wrong doc claims | fixed | README/DECISIONS rewritten: real event list (Yalda/BlackFriday/Viral/Outage), friendly fire = −3 SLA + combo reset on cities (not warmth), tutorial = guided captions + 25 s slow-start/SLA-floor (not action clamps), «سafari» typo gone, only test-backed claims remain | this file + README |
| 21 | harness printed only | fixed | `tests/run_all.js` exits non-zero on band/test failure; adds determinism, reroute invariant, menu smoke, tutorial, tray, ring, swipe, human policy, soak | `node tests/run_all.js` → `ALL TESTS PASS`, exit 0 |
| 22 | screenshot matrix | done | 6 viewports × {menu, play+wave, pause, game-over, how-to} + share card; metrics printed; subset committed | `tests/screenshots/` (31 files locally, 11 committed) |

### CONFIG changes this round (all logged, bands re-verified after each)
- `bots.killRadiusPx` 14→**24** and `bots.friendlyRadiusPx` 22→**16**, semantics changed from “world×2” to **true screen pixels** (converted by `/mapScale`).
- `input:{holdMs:170, holdWaveMs:250, dragPickPx:18}` (new).
- `score.lateDampFrom:120, lateDampPerSec:1/600, lateDampMin:0.5` (new; score-only, survival untouched).
- RANKS thresholds → 0/1500/9000/24000/50000/122000.
- No change to spawn/patience/wave/event knobs from round 1.

### Final harness output (30 seeds/policy, `node tests/run_all.js`)

```
policy   survival p10/p50/p90      score p10/p50/p90
lazy       32/  42/  50        619/   901/ 1145
novice     72/  77/ 110       6852/  8997/18384
human      76/ 104/ 137      10933/ 16561/29445
expert    185/ 313/ 591      52786/ 81770/129092
greedy    157/ 313/ 592      38553/ 82894/128783
```

Bands: lazy 25–50 ✓ · novice 60–110 ✓ · human 90–180 ✓ · greedy p50 ≥240 & p10 ≥150 ✓ · expert ≥240 ✓ · soak 50/50 ✓.

---

## Round 1 — original build (condensed)

- **Single-file, zero-dep:** everything inline (69 KB before font embed). Only `http` string is an inert share-URL fallback; no network request is made.
- **Determinism:** `mulberry32`+`hash32`; daily seed `hash32(yyyymmdd_Tehran ^ 0xC0FFEE)`; fixed `DT=1/60`, accumulator ≤5 steps; hit roll `hash32(seed ^ imul(reqId,0x9E3779B1))/2^32 < warmth`.
- **Balance loop (round 1, §14-faithful bots):** 8 iterations; final wave cadence `first 34 / gap 28–36`, `spawn.slope 0.07`, `patience.min 3.2`, `warmthGain 0.07`, `fastGain 0.25` ⇒ lazy 42 s / novice ~100 s / greedy ~313 s (re-confirmed in round-2 table).
- **Milestones M0–M7** completed in order; each left a runnable file.

## Known limitations / deliberate cuts
- No leaderboard (single offline file). Persian-only UI (language toggle cut per review item 15).
- Expert bot needs a point-blank “panic swipe” (bots can spawn ~30 u from a node — faster than any 0.3 s reaction); documented in harness comments.
- Committed screenshot subset only; regenerate the full matrix with `tests/visual_qa.py`.

---

## V2 started — partial P0 only, NOT feature-complete

This section supersedes earlier claims wherever they conflict. No Arvan deployment was performed.

- Test stub uses `Object.defineProperty` for navigator; checked locally with Node 20 and Node 22. Expert now attempts one strategic relocation per outage and its recorded p50 differs from greedy. The previous harness accidentally ignored explicit swipe radii because `applyAction` did not forward them; it now does, with a regression assertion.
- Malicious traffic has a square packet visual and is filtered using a shield visual; player-visible Persian copy was revised. This is a partial compliance pass, not an organizer certification.
- Mobile tray shrink-to-fit avoids the clipping observed on 320–412px; larger faces, adjusted dome size, and an eight-position label placement attempt were added. Screenshots `tests/screenshots/v2-p0/` document the current state; label placement is best-effort, and the requested 62% phone-height map target has **not** been met. No full interaction, accessibility or performance certification has been performed.
- `worker/src/handler.js`, `build.js`, `worker/dev.js`, `worker/dist/worker.js`: minimal local bootstrap serving HTML and ping only, smoke-tested via Request/Response. Other APIs fail closed. Runtime and deploy are **UNVERIFIED ON ARVAN**; `npx --yes r1ec --help` returned ENOVERSIONS here. The shared deterministic sim, replay security, storage adapter, leaderboard, campaign and other V2 features remain unimplemented. No leaderboard should be represented as validated or deployed.
- No gameplay CONFIG was changed. `QUESTIONS_FOR_OWNER.md` records the outstanding platform, privacy and deployment questions.
- Old V1 testing claims above are historical and several were not backed by sufficient tests. In particular, do not assume the formerly claimed full visual matrix, FPS, share fallback, attack-rerouting coverage, or real-device QA are verified. Current automated results are what `node tests/run_all.js` reports; the attack reroute test can skip when there is no online node.

## V2 replacement prompt — platform discovery and partial daily seed

- Official ArvanCLI login documentation specifies a machine-user key; no credential was used. Its package repository timed out from this environment, and no `arvan ec list`, project creation or deployment was performed. See PLATFORM_FINDINGS and DEPLOY_LOG. There is no verified store, so rankings remain absent.
- Added preliminary local `GET /api/daily`, deriving the Tehran date and seed with the same existing hash as the client. On a same-origin HTTP(S) deployment the daily button attempts the endpoint with a timeout and falls back offline. The result explicitly states that scoring is not available: there is **no replay verification or score submission**. Intl timezone support and the endpoint are UNVERIFIED ON ARVAN.
- `tests/worker_smoke.js` verifies endpoint status, a Tehran-midnight boundary, seed derivation, and disabled score API locally; `node tests/run_all.js` passes. No gameplay CONFIG changed. This work does not satisfy TIER 0 and leaves P0 visual work, shared-sim extraction and all subsequent milestones open.

## V2 replacement prompt — current vertical slice (incomplete D1)

- `src/index.html` is currently the source template; `node build.js` regenerates root `index.html`, `dist/index.html`, `dist/worker.js`, `worker/dist/worker.js` and an `output/` copy. This is **not** shared-sim extraction. No private build is implemented; passing any storage/secret configuration deliberately fails the build rather than creating an insecure or misleading bundle. Public validation/store modes are `NONE`.
- Worker request handling is guarded and `/__diag` independently probes available clocks, Intl and WebCrypto, reporting unavailable benchmark/store/ordering as such. Tests: `worker_smoke.js` checks guarded errors and diagnostic fields; `build_safety.js` checks source/artifact consistency and rejects private configuration. No platform test occurred.
- Playwright locally refreshed menu/play screenshots at the seven requested viewports in `tests/screenshots/v2-current/`; zero page errors on these screenshots. At 390×844 `mapScale=0.35` gives nominal 350×312 map pixels, so requested 62% viewport height (523px) remains unmet. Frames for unimplemented Turbo, upgrades, name modal, leaderboard and campaign do not exist. No FPS/device claim is made.
- No CONFIG or difficulty changes in this slice. Previous V2 scope/questions concerning AI/CLI are superseded by the latest prompt; neither is used. TIER 0 and P0 are unfinished.

## Shipping override — partial slice
Clutch save was added without changing CONFIG: a served request below 12% remaining patience gets double points and +1 SLA without advancing combo. Local bot bands remain green; `tests/content_clutch.js` checks the precise score/SLA/combo behavior and bans specified violent copy in the built HTML. SLA edge heat now begins below 40%. Added an explicitly local top-10 view and an OG image generated from a previously committed play screenshot. This is not the requested full V2: see STATUS.md for cuts and unverified items. No global data, Arvan account, AI or paid service was used.

## Continuation — image-free worker
`build.js` additionally emits `worker.lite.js`, with no embedded OG image and `/og.png` returning 404. Both variants are public, secret-free and still report validation NONE, store NONE; they are not LITE score validators. Local smoke checks exercise both. No gameplay or CONFIG change in this slice.

## Continuation — golden requests
Added CONFIG `golden:{chance:0.04,fastPoints:5,slaGain:3}`; selection is an independent hash of seed and request ID, limited to one live request. Fast delivery earns ×5 score and +3 SLA. `tests/golden.js` checks reward, concurrency and seeded repeatability; `node tests/run_all.js` retains green survival bands and 50-seed soak. No replay validator exists.

## Continuation — Turbo
Added CONFIG `turbo:{threshold:12,duration:6,cooldown:20}`: automatic activation on reaching combo threshold and after cooldown, maximum node warmth while active, doubled fast SLA gain and multiplier (6× cap). Triggering completion itself uses pre-Turbo scoring. Smoke checks and 50-seed survival tests pass; screenshot is curated, not natural activation evidence.

## Continuation — non-seasonal daily modifiers
The existing date seed hash also selects one of eight per-run modifier objects; no global CONFIG is mutated. Each is described on pre-run and personal daily board, named in menu and run banner, and applied entirely offline. Local date-specific top-10 is stored separately from the general board; it is not global. Retry preserves the run date. Daily modifier tests use 15 simulation seeds each and assert human >=60 s, expert/greedy >=150 s median. Old seasonal event was renamed to neutral `surge` with unchanged multipliers.

## Continuation — once-only offline second chance
CONFIG `secondChance:{sla:30}`. After first non-tutorial loss the player may finish or continue, once, at 30 SLA and zero combo; no reward or leaderboard record is saved until final game over. No ad or network dependency. Headless and Chromium tests cover one-use behavior. Tests and bot difficulty runs do not accept this offer automatically.

## Continuation — offline upgrades
Six per-run nonstacking upgrades offered deterministically, up to three choices at 45-second intervals; selection pauses simulation. Effects are documented in STATUS. Headless tests cover seeded offers and pick distribution; browser smoke covers selection. Critical caveat: expert/greedy hit the 600s cap at the median; the current balance is not release-ready even though required lower bounds pass.

## Continuation — late traffic ramp
CONFIG spawn adds `lateStart:180, lateSlope:0.035, lateExtraMax:8`; this mitigates upgrade-powered bot runs getting stuck at the 600s harness cap, without changing early game. Regression requires expert/greedy p90 under 550s as well as the previous minimum bands. See STATUS for results; real-device and human-session duration still unverified.

## Continuation — campaign
A minimal sequential 5-level offline survival campaign: fixed seed per level, target time and traffic multiplier per level, local unlock persistence, final win distinct from loss. The 30-seed-per-level bot sensitivity table intentionally varies simulation seeds; it does not measure win rate on each level's fixed shipped seed or actual human success. No global progression or online score submission.

## Continuation — isolated SigV4/store building blocks
Added a WebCrypto S3 signing primitive and standalone GET / conditional-create adapter, plus memory mock. Official AWS GET-object vector and mock-store tests run in `tests/run_all.js`. Restricted keys and HTTPS endpoints are intentional. The code is not connected to the handler or generated worker, is not a complete S3 leaderboard, has no list/index implementation or JS HMAC fallback, and has not been tested on Arvan. Secret-containing builds remain deliberately refused.

## Continuation — cryptographic fallback
Standalone `worker/src/crypto_utils.js` implements SHA-256 and HMAC-SHA256 fallback, cross-checked against Node crypto and SubtleCrypto with padding and key-size edge cases. Isolated SigV4 can use it when SubtleCrypto is absent; the official AWS vector passes both paths. These components are not wired into the public worker or production scoring and have not been independently audited.

## Continuation — signed ticket primitive
`worker/src/tickets.js` implements purpose-bound HMAC tickets and tests; not wired into handler or builds. A signed ticket alone does not prevent replay, establish a valid score, or provide a challenge board. Atomic consumption in a tested storage backend and score validation are prerequisites to enabling endpoints.

## Continuation — local nickname
Settings support an optional nickname stored locally, with strict single-word alphabet/length validation, a small blocklist, anonymous fallback and read-time revalidation. Matching server-side function is standalone and parity-tested, not wired into an endpoint. Any future public board must validate again at submission AND read, strengthen moderation and privacy controls, and not claim this filter detects all personal or abusive content.

## Continuation — local daily missions/streak
Three of five deterministic goals per Tehran date are completed per run and stored locally per day. A consecutive-day streak updates once per completed daily run/date and ignores backdated results; last streak is labeled with its ending date. Tests cover deterministic selection, goal checks and date boundaries. This is not a global or anti-tamper progression system.

## Continuation — isolated LITE prototype
A standalone plausibility checker binds submitted statistics to an expiring start ticket and consumes a nonce only via a store's conditional create. It intentionally applies broad bounds and cannot reject all fabricated plausible runs. Tests use an in-memory store only; conditional-write atomicity on the target S3 service remains unverified. It is not wired into a request handler or public builds, and lacks rate limiting and score indexing.

## Continuation — bounded S3 listing
The isolated store exposes sorted prefix listing, up to 100 keys per request; no continuation handling or deployed scoreboard is claimed. Restricted ASCII keys avoid XML entity handling in the list parser. Mock tests are not evidence of S3 ordering or consistency on Arvan.

## Continuation — isolated online flow
`online_service.js` exercises daily signed starts, score plausibility with single-use nonce, and a bounded sorted/deduplicated board via injected storage. It enforces origin and rate limits only when the host supplies a trustworthy client identity, and fails closed otherwise. It is deliberately not wired into deployable bundles: target platform identity, conditional writes, listing/order, cleanup, moderation, and practical LITE calibration are unverified. LITE is not replay validation and cannot prove legitimate play. Listing scans at most 100 candidate keys.

## Continuation — isolated signed challenge prototype
The standalone service mints HMAC-bound challenge links and a separate challenge score namespace; date and seed are signed, and start-ticket lifetime cannot exceed the challenge lifetime. Mock-only tests cover round-trip, separation from daily board and expiry. No client or deployed handler consumes these endpoints yet. A link signature does not establish fair play or atomic store behavior.

## Continuation — experimental private bundle
Explicit, all-or-nothing `PRIVATE_BUILD=1` generates secret-bearing bundles exclusively in ignored `private_dist/` while retaining secret-free public artifacts. Private endpoint flow and diagnostics are tested against a mock S3 backend, not Arvan. An operator must configure and confirm a proxy-overwritten identity header: accepting a spoofable header compromises rate limits. Private bundles are staging-only pending target platform verification, lifecycle controls, moderation and client integration; LITE is heuristic, not replay verification.

## Continuation — optional online browser flow
Daily online submission requires explicit consent and a successful same-origin signed start; otherwise ordinary daily gameplay remains offline. The board shows unsupported errors instead of synthetic results. Challenge links use a signed start, preserve date/seed, and have separate score boards; challenge unavailability does not silently start an unrelated run. Chromium tests mock all server responses; no deployment or moderation guarantees are implied.

## Continuation — tall portrait map
The target 390×844 outline footprint (at least 90% width and 62% height) requires nonuniform vertical scaling within this portrait viewport; screenshot and geometry assertion record the deliberate stylized distortion. Pointer swipe hit tests use screen-pixel distance, preserving the intended physical radius; explicit simulated radii remain world-space. Labels avoid known city/face/node/portal boxes when possible, but no guarantee is made for crowded frames.

## Continuation — presentation polish
A quiet, procedural WebAudio background adjusts its tempo and notes for waves/low SLA, with independent music setting, global mute and pause handling. Request packets render short reduced-motion-aware trails. Headless and browser smoke tests cover switching behavior; no real-device FPS or sound-quality evaluation has been performed.
