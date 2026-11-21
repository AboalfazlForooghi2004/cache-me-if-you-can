'use strict';
const assert=require('assert'),{G,runBot}=require('./balance_harness');
const days={};for(let i=1;i<=31;i++){let d='202611'+String(i).padStart(2,'0'),m=G.dailyModifier(d);days[m.id]??=d}
assert.equal(Object.keys(days).length,8);function median(a){return a.sort((a,b)=>a-b)[Math.floor(a.length/2)]}
console.log('Daily modifier: sample date | human / expert / greedy median seconds (15 seeds)');
for(const [id,date] of Object.entries(days)){assert.equal(G.dailyModifier(date).id,id);let vals=[];for(const p of ['human','expert','greedy']){let ts=[];for(let i=1;i<=15;i++)ts.push(runBot(i*777+13,p,600,date).t);vals.push(median(ts));}console.log(id,date,vals.map(x=>Math.round(x)).join(' / '));assert(vals[0]>=60&&vals[1]>=150&&vals[2]>=150,id+' survival threshold')}
console.log('PASS eight date-selected modifiers and bot median thresholds');
