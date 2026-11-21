'use strict';const assert=require('assert'),{G,runBot}=require('./balance_harness');
assert.equal(G.CAMPAIGN.length,5);
G.newRun(42,'campaign',{campaignLevel:0});let s=G.state;s.nextArrival=999;s.t=G.CAMPAIGN[0].seconds-.01;G.step(1/60);assert(s.won&&s.over);assert(!G.useSecondChance()||!s.won,'win must not be continuable');
console.log('Campaign level win rates across 30 varied game seeds; no second chance:');
for(let level=0;level<5;level++){let vals=[];for(let p of ['human','expert','greedy']){let wins=0;for(let i=1;i<=30;i++)if(runBot(i*777+13,p,600,null,level).won)wins++;vals.push(wins)}console.log((level+1)+': '+vals.map(n=>Math.round(n*100/30)+'%').join(' / '));assert(vals[1]>0&&vals[2]>0)}
console.log('PASS five campaign levels and victory transitions');
