'use strict';
const assert=require('assert');const G=require('./balance_harness.js').G;
function fast(golden){G.newRun(9,'endless',{tutorial:false});const s=G.state;s.nextArrival=999;s.sla=50;s.requests.push({id:999,city:0,spawnT:0,patience:10,heavy:false,nodeId:null,route:'origin',phases:[],assignT:0,doneAt:0.5,totalDur:0.5,done:false,released:false,cost:1,originCounted:false,golden});for(let i=0;i<31;i++)G.step(1/60);return {score:s.score,sla:s.sla,event:s.events.find(x=>x.type==='requestServed')};}
let normal=fast(false),gold=fast(true);assert.equal(gold.score,normal.score*5);assert.equal(gold.sla,normal.sla+3);assert.equal(gold.event.golden,true);
function sequence(){G.newRun(42,'endless',{tutorial:false});const s=G.state;const seen=[];for(let i=0;i<6000&&!s.over;i++){G.step(1/60);let n=s.requests.filter(r=>r.golden).length;assert(n<=1);for(const r of s.requests)if(r.golden&&!seen.includes(r.id))seen.push(r.id)}return seen}
const a=sequence(),b=sequence();assert.deepEqual(a,b);assert(a.length>0);console.log('PASS golden fast reward, one alive maximum, seeded repeatability');
