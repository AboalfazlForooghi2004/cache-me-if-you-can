'use strict';const assert=require('assert'),{G,runBot}=require('./balance_harness');
function offers(){G.newRun(1729,'endless',{tutorial:false});let s=G.state;s.nextArrival=999;s.t=44.99;G.step(1/60);assert.equal(s.phase,'upgrade');let first=s.upgradeOffer.slice();assert.equal(first.length,3);assert(!G.chooseUpgrade('invalid'));let t=s.t;G.step(1/60);assert.equal(s.t,t);assert(G.chooseUpgrade(first[0]));assert(!G.chooseUpgrade(first[0]));assert.equal(s.phase,'play');return first}
assert.deepEqual(offers(),offers());
let counts={capacity:0,warmth:0,patience:0,speed:0,recovery:0,shield:0},total=0;
for(let i=1;i<=30;i++){let r=runBot(i*777+13,'human');for(let u of r.upgrades){counts[u]++;total++}}
console.log('Human bot upgrade choices: '+JSON.stringify(counts)+'; total '+total+' (first offered choice policy, 30 seeds)');assert(total>0);assert(Object.keys(counts).every(k=>counts[k]>0));console.log('PASS deterministic upgrade offers, pause, valid once-only choices and pick coverage');
