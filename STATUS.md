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
- Mega-packet boss; campaign levels 6–8; streak/missions; global board; share-card V2 polish; campaign levels 1–5; all upgrades; golden requests; Turbo; second chance; name flow; LITE validation; SigV4/S3/private builds; adaptive music and full hype. These include requested never-cut items: this is an incomplete delivery, not a claim of a shippable release.
- Campaign win rates and upgrade pick rates cannot be reported because those features do not exist.

## Platform and delivery
All Arvan claims remain **UNVERIFIED ON ARVAN**. No Arvan account or CLI touched. The environment does not expose `GITHUB_TOKEN`; unauthenticated push was rejected. A complete local output folder, repository archive and git bundle are generated for manual delivery. Do not upload this unfinished prototype over live V1.
