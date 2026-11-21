'use strict';
const {spawnSync}=require('child_process');
for (const file of ['build.js','tests/balance_harness.js','tests/worker_smoke.js','tests/build_safety.js','tests/content_clutch.js','tests/golden.js','tests/turbo.js','tests/daily_modifiers.js','tests/second_chance.js']) {
 const p=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(p.status!==0)process.exit(p.status||1);
}
