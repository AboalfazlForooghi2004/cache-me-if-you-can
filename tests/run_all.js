'use strict';
const {spawnSync}=require('child_process');
for (const file of ['tests/balance_harness.js','tests/worker_smoke.js']) {
 const p=spawnSync(process.execPath,[file],{stdio:'inherit'});
 if(p.status!==0)process.exit(p.status||1);
}
