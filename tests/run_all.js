'use strict';
const {spawnSync}=require('child_process');
for (const file of ['build.js','tests/balance_harness.js','tests/worker_smoke.js','tests/build_safety.js','tests/content_clutch.js','tests/golden.js','tests/turbo.js','tests/daily_modifiers.js','tests/second_chance.js','tests/upgrades.js','tests/campaign.js','tests/share_card.js','tests/s3_signing.js','tests/crypto_utils.js','tests/tickets.js','tests/nickname.js','tests/missions.js','tests/lite_validation.js','tests/store_list.js','tests/s3_arvan_compat.js','tests/online_service.js','tests/private_build.js','tests/runtime_env.js','tests/arvan_diagnostics.js','tests/map_scaling.js','tests/music.js','tests/lite_calibration.js','tests/store_limits.js']) {
 const p=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(p.status!==0)process.exit(p.status||1);
}
