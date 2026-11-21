# Shipping status — incomplete; do not replace live V1

## Implemented and tested locally
- Existing Node 21+ navigator fix, distinct expert policy, guarded worker, partial non-violent packet reskin and mobile tray fix. The gameplay engine remains V1-derived and runs offline.
- Non-violent banned-copy scan (`tests/content_clutch.js`). Deterministic clutch save: under 12% patience doubles points, adds 1 SLA and does not increment combo; explicit regression test. SLA-under-40 vignette respects reduced motion. Adaptive music and most other hype features remain absent.
- Local top-10 screen labelled «جدول شخصی» using already-local score records, not a global leaderboard; browser smoke exercised the empty board and menu/play at seven viewports. Old records may have only five entries. Name entry is not implemented.
- Thumbnail and OG PNG rendered from an earlier committed gameplay screenshot; showcase copy supplied. `/og.png` returns the embedded PNG; tested byte-for-byte locally.
- `node tests/run_all.js`: green, including syntax-related build checks, content/clutch, simulated gameplay, 50-seed invariants, worker and build safety. Existing soak is not a replay test.
- Build: public only, store NONE, validation NONE. `private_dist/` is not supported: builds fail closed when secret/store environment variables are present. `/__diag` does not benchmark the simulation or contact a store.

## Partial / unverified
- Stage 1 is **partial**: 390×844 map nominally 350×312px (height target 523px unmet); labels still can overlap. Adaptive music, packet trails and full hype are not implemented. Browser screenshots under `tests/screenshots/stage-current/` cover menu/play at seven sizes plus local board; they are not a full feature matrix and no device FPS was measured.
- Stage 3 local board is **partial**: no name input, score upload, HMAC, LITE validation, secret builds, or anti-replay. `/api/daily` seed is local-tested; scoring is disabled. No challenge tokens.
- Stage 6 is **partial**: assets and limited screenshot QA only; not all requested screens exist.

## Cut / not implemented in this run
- Mega-packet boss; campaign levels 6–8; streak/missions; global board; share-card V2 polish; name flow; LITE validation; SigV4/S3/private builds; adaptive music and full hype. These include requested never-cut items: this is an incomplete delivery, not a claim of a shippable release.
- Campaign and upgrade simulation tables are documented in the later sections.

## Platform and delivery
All Arvan claims remain **UNVERIFIED ON ARVAN**. No Arvan account or CLI touched. The initial unauthenticated push was rejected; authenticated pushes subsequently succeeded. The output folder includes a repository archive and git bundle for manual delivery. Do not upload this unfinished prototype over live V1.

## Continuation — delivery slice
- GitHub `main` was fast-forwarded to `e4eb018` and historical commit `ab1c4e3` was tagged `v1-live` before this slice. The tag is a historical anchor; correspondence to the owner's live deployment is unverified.
- Added a second image-free `worker.lite.js` bundle; local worker smoke tests verify that `/` works and `/og.png` returns 404 in the lite bundle. Both bundles remain `store NONE / validation NONE`; lite does not mean LITE validation. Private builds, S3 and all other missing items above remain unavailable.
- No Arvan calls were made. All runtime compatibility and platform limits remain UNVERIFIED ON ARVAN.

## Continuation — golden-request slice
- Implemented deterministic golden selection at 4% per request via seed/id hash, at most one live, ×5 score and +3 SLA when fast, with a gold mark and burst. `tests/golden.js` verifies the fast reward, one-live limit and seeded repeatability. The 50-seed existing soak and difficulty bands pass. `tests/screenshots/stage-current/390x844-golden.png` is a curated browser capture (golden flag set through test API), not evidence of natural spawn frequency.
- CONFIG added: golden `{chance:0.04, fastPoints:5, slaGain:3}`. Score percentiles changed, as recorded in the final harness output. At that slice Turbo, second chance, upgrades, daily modifiers, replay validation and the global leaderboard were unimplemented; later slices below supersede that status.

## Continuation — Turbo slice
- Implemented deterministic automatic Turbo on combo ≥12: 6s active, then 20s cooldown. Active ticks maximize node warmth, double fast SLA gain and double the score multiplier (capped at 6×), with gold border and activation banner. Triggering request itself earns ordinary score; effect starts after it completes. `tests/turbo.js` exercises activation, warmth, duration/cooldown. `390x844-turbo.png` is a curated state capture, not a natural play-through.
- Latest `node tests/run_all.js`: ALL TESTS PASS, including existing bands and 50-seed soak. Survival p10/p50/p90: lazy 32/42/50, novice 74/80/110, human 77/105/138, expert 193/313/600, greedy 158/342/600 seconds. Scores: lazy 642/936/1145, novice 9971/14392/24191, human 14485/23678/38433, expert 68289/110448/184636, greedy 52791/119312/184416. These are ordinary-mode results, not modifier/campaign results.
- `CONFIG.turbo={threshold:12,duration:6,cooldown:20}`. Features earlier listed as missing remain missing except golden and Turbo; no upgrade choices or second chance at that point; daily modifiers were added in the later slice below.

## Continuation — Tehran daily modifiers
- Eight non-seasonal named modifiers are chosen by the Tehran date hash and apply deterministic per-run effects (traffic, patience, warmth, edge speed, damage, recovery, points). Name and description appear in pre-run and personal daily board; the name also appears on the menu and at run start. Daily board is separately stored per date, only on the device. Seed/date are preserved when retrying, including across midnight. The same-origin seed endpoint is accepted only if date and hash match the locally selected Tehran date; offline mode remains playable. Historical generic event was renamed from seasonal copy to a neutral traffic surge.
- `tests/daily_modifiers.js` covers all eight modifiers with 15 seeds each and requires human median >=60 s, expert/greedy >=150 s. Sample dates and medians human/expert/greedy: rush 107/203/232, warm 107/358/313, patient 109/358/313, resilient 109/358/313, steady 109/501/527, efficient 108/513/514, recovery 109/358/313, reward 108/358/313 seconds. These are simulations, not human/device measurements.
- `tests/visual_stage.py` passed seven viewports; 390x844 daily intro and local board were additionally checked in Chromium. User-scrollable menu card on the shortest screen still needs layout polish. No Arvan deployment tested.

## Continuation — second chance
- A once-per-run, opt-in second chance now appears on first game over (except tutorial): continue with 30 SLA and reset combo, or finish normally. It is free and works offline; no intermediate score is persisted before the decision. Test `tests/second_chance.js` verifies the simulation's once-only state transition; `tests/visual_v2.py` exercises both UI and final game over in Chromium. Screenshots include `390x844-second-chance.png` and daily screens. Bot balance tables above deliberately use the original policy with no second-chance acceptance and so are conservative, not player-session predictions.
- Second chance is no longer a missing item. At that point upgrades, campaign, secure names and online features were missing; see later sections. `node tests/run_all.js` passes. Latest authenticated remote push remains at `9fc6cd6`; a new unauthenticated push failed because this environment does not expose `GITHUB_TOKEN`, so subsequent local commits need pushing or manual bundle transfer.

## Continuation — six upgrade choices
- At 45 seconds and then every 45 seconds after a choice, deterministic seed-based offers present up to three distinct unowned upgrades; simulation pauses until a valid choice. Each can be chosen once per run: capacity +1, warmth gain +10%, request patience +4%, edge travel −5%, fast-SLA gain +15%, timeout damage −10%. They apply only for that run. Tutorial does not offer upgrades; subsequent play resumes without a network dependency. The capacity indicator shows five pips when upgraded.
- `tests/upgrades.js` covers deterministic offers, pause and rejecting invalid/duplicate choices, plus 30 human-bot runs. The first-offered-choice policy made 64 picks: capacity 15 (23.4%), warmth 5 (7.8%), patience 7 (10.9%), speed 10 (15.6%), recovery 15 (23.4%), shield 12 (18.8%). These are synthetic policy pick frequencies, not human preference data. Chromium screenshot `390x844-upgrade.png` uses a curated time jump. Tests pass, including 50-seed soak and eight modifier medians.
- Important balance limitation: expert and greedy frequently reach the 600s harness cap with upgrades; daily expert/greedy median is 600s for all modifiers. This does not establish an actual median of 600s or adequate session length, and needs tuning/playtesting before release. At that point campaign and secure online functionality were unimplemented; see subsequent sections. The prior missing-upgrades statements are superseded by this section.

## Continuation — late-game balance after upgrades
- To prevent upgrade-enabled expert/greedy sessions routinely reaching the 600-second harness cap, added a late traffic ramp beginning at 180s: +0.035 requests/sec per second, capped at +8 requests/sec. Normal-mode survival p10/p50/p90 (30 seeds): lazy 32/42/50, novice 74/82/110, human 77/106/180, expert 243/308/403, greedy 243/308/403. Score percentiles: 642/936/1145, 10179/15058/24210, 14656/25674/56644, 94078/129174/172708 and 95317/130940/173813 respectively. The synthetic policies automatically pick the first offered upgrade, and never accept second chance.
- Modifier median human/expert/greedy seconds (15 seeds each): rush 107/294/296, warm 107/316/317, patient 109/316/317, resilient 109/316/317, steady 109/344/344, efficient 106/361/361, recovery 109/316/318, reward 109/316/317. This supersedes the capped results above. `tests/balance_harness.js` now requires expert and greedy p90 <550s as well as existing lower thresholds. Human playtesting and real-device performance remain unverified.

## Continuation — five-stage offline campaign
- Added an offline five-stage survival campaign, each with a deterministic level seed, level name, target time (45/60/75/90/105s), progressively increased traffic multiplier (0.85/0.90/0.95/1.00/1.05), elapsed/target display, win state, locally persisted sequential unlocks and once-per-run second chance on losses. This is a simple survival interpretation, not evidence of any unimplemented extra campaign-specific mechanics.
- `tests/campaign.js`: 30 varied simulation seeds per level, human/expert/greedy win rates: level 1 100/100/100%, level 2 100/100/100%, level 3 97/100/100%, level 4 87/100/100%, level 5 40/100/100%. Tests use varied seeds to estimate balance, whereas actual play uses one fixed seed per level; policy chooses the first upgrade and does not accept second chance. Rates are not human playtest results. `tests/visual_v2.py` checks selection, locked level, a curated victory and unlocking.
- Missing ship-blocking functionality still includes safe nickname flow, all authenticated/private store/validation/challenge functionality, and requested progression/streak/missions and remaining UI/QA polish. No Arvan deployment verification.
