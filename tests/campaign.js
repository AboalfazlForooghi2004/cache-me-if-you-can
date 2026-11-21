'use strict';const assert=require('assert'),{G,runBot}=require('./balance_harness');
assert.equal(G.CAMPAIGN.length,8);
G.newRun(42,'campaign',{campaignLevel:0});let s=G.state;s.nextArrival=999;s.t=G.CAMPAIGN[0].seconds-.01;G.step(1/60);assert(s.won&&s.over);assert(!G.useSecondChance()||!s.won,'win must not be continuable');
G.newRun(123,'campaign',{campaignLevel:7});s=G.state;s.bots.push({id:999,x:500,y:400,alive:true,mega:true,hitsLeft:3,lastHit:-1,targetNodeId:0});G.applySwipe(480,400,520,400,30,1,1);assert.equal(s.bots[0].hitsLeft,2);s.t+=.2;G.applySwipe(480,400,520,400,30,1,1);assert.equal(s.bots[0].hitsLeft,2);G.applySwipe(480,400,520,400,30,1,2);assert.equal(s.bots[0].hitsLeft,1);s.t+=.1;G.applySwipe(480,400,520,400,30,1,3);assert(s.bots[0].alive);s.t+=.06;G.applySwipe(480,400,520,400,30,1,3);assert(!s.bots[0].alive);
for(let seed=1;seed<=10;seed++){let a=runBot(seed*987,'expert',180,null,7),b=runBot(seed*987,'expert',180,null,7);assert.deepStrictEqual(a,b,'level 8 deterministic soak');}
G.newRun(99,'campaign',{campaignLevel:5});s=G.state;s.t=96;s.nextArrival=999;G.step(1/60);assert(s.slotsTotal<=4);
console.log('Campaign level win rates across 30 varied game seeds; no second chance:');
for(let level=0;level<8;level++){let vals=[];for(let p of ['lazy','human','expert','greedy']){let wins=0;for(let i=1;i<=30;i++)if(runBot(i*777+13,p,600,null,level).won)wins++;vals.push(wins)}console.log((level+1)+': '+vals.map(n=>Math.round(n*100/30)+'%').join(' / '));if(level>=5){assert.equal(vals[0],0);assert(vals[2]>=27&&vals[3]>=27);assert(vals[1]>=([12,9,6][level-5])&&vals[1]<=([18,15,12][level-5]))}}
console.log('PASS eight campaign levels and victory transitions');
