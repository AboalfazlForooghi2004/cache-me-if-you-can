'use strict';
const assert=require('assert'),G=require('./balance_harness.js').G;
G.newRun(81,'endless',{tutorial:false});let s=G.state;G.placeNode(0);s.t=10;s.combo=11;s.nextArrival=999;s.timeline.evI=s.timeline.events.length;s.timeline.waveI=s.timeline.waves.length;
s.requests.push({id:999,city:0,spawnT:9.5,patience:10,heavy:false,nodeId:null,route:'origin',phases:[],assignT:9.5,doneAt:10.01,totalDur:.51,done:false,released:false,cost:1,originCounted:false});
G.step(1/60);assert(s.turboUntil>s.t);assert(Math.abs(s.turboUntil-s.t-6)<1e-8);assert(Math.abs(s.turboReadyAt-s.turboUntil-20)<1e-8);
s.nodes[0].warmth=.25;G.step(1/60);assert.equal(s.nodes[0].warmth,G.CONFIG.nodes.warmthMax);const end=s.turboUntil,ready=s.turboReadyAt;
for(let i=0;i<365;i++)G.step(1/60);assert(s.t>end&&s.t<ready);assert.equal(s.turboUntil,end);console.log('PASS turbo activation, max warmth, duration and cooldown');
