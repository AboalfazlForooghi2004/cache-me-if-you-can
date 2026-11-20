'use strict';
// Local illustrative benchmark only; not a substitute for an Arvan CPU measurement.
const {performance}=require('perf_hooks');
const {G}=require('./balance_harness.js');
G.newRun(4242,'endless',{tutorial:false});
G.placeNode(0);G.placeNode(1);
const started=performance.now();
let count=0;
for(;count<10000 && !G.state.over;count++)G.step(1/60);
const ms=performance.now()-started;
console.log(`Local sim: ${count} ticks in ${ms.toFixed(1)} ms; ${(ms*10000/Math.max(count,1)).toFixed(1)} ms/10k (scaled, single run; stops at game-over)`);
