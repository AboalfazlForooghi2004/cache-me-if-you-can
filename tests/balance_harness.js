const fs=require('fs');
let html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');
let js=html.match(/<script>([\s\S]*)<\/script>/)[1];
function fakeCtx(){return new Proxy({},{get:(t,k)=>{if(k==='createLinearGradient'||k==='createRadialGradient')return()=>({addColorStop(){}});if(k==='canvas')return{};return()=>{}},set:()=>true})}
function fakeEl(){return {style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},getContext:()=>fakeCtx(),getBoundingClientRect:()=>({left:0,top:0}),querySelectorAll:()=>[],createElement:()=>fakeEl(),appendChild(){},textContent:'',offsetWidth:0}}
global.window={addEventListener(){},matchMedia:()=>({matches:false}),AudioContext:null,webkitAudioContext:null,innerWidth:390,innerHeight:844};
global.document={getElementById:()=>fakeEl(),querySelectorAll:()=>[],addEventListener(){},createElement:()=>fakeEl(),hidden:false};
global.location={search:'',href:'http://localhost/'};
global.localStorage={getItem:()=>null,setItem(){}};
global.navigator={};
global.requestAnimationFrame=()=>{};
global.performance={now:()=>Date.now()};
eval(js);
const G=window.__game;
const DT=1/60;
const dist=(a,b,c,d)=>Math.hypot(a-c,b-d);
function nodePos(S,n){const c=S.cities[n.cityIdx];return[c.x,c.y]}
function runBot(seed,policy){
  G.newRun(seed,'endless',{tutorial:false});
  const S=G.state;
  let t=0;
  const greedyOrder=[0,1,2,4,3]; let gi=0;
  let react=1+Math.random()*2;
  const swiped=new Set(), rolled=new Set();
  while(!S.over && t<600){
    if(policy==='greedy'){
      while(gi<greedyOrder.length && S.nodes.length<S.slotsTotal){ G.applyAction({type:'place',city:greedyOrder[gi]}); gi++; }
      for(const b of S.bots){ if(!b.alive||swiped.has(b.id))continue;
        const n=S.nodes.find(n=>n.id===b.targetNodeId); if(!n)continue;
        const[np_x,np_y]=nodePos(S,n);
        if(dist(b.x,b.y,np_x,np_y)<250){ G.applyAction({type:'swipe',x1:b.x,y1:b.y-30,x2:b.x,y2:b.y+30}); swiped.add(b.id); } }
    } else if(policy==='novice'){
      react-=DT;
      if(react<=0){ if(S.nodes.length<S.slotsTotal){ G.applyAction({type:'place',city:Math.floor(Math.random()*15)}); } react=1+Math.random()*2; }
      for(const b of S.bots){ if(!b.alive||rolled.has(b.id))continue; rolled.add(b.id);
        if(Math.random()<0.35){ G.applyAction({type:'swipe',x1:b.x,y1:b.y-30,x2:b.x,y2:b.y+30}); } }
      if(S.nodes.length>0 && Math.random()<DT/25){ const n=S.nodes[Math.floor(Math.random()*S.nodes.length)]; G.applyAction({type:'move',node:n.id,city:Math.floor(Math.random()*15)}); }
    }
    G.step(DT); t+=DT;
    if(S.sla<0||S.sla>100) throw new Error('SLA out of range '+S.sla);
    if(S.originInFlight<0) throw new Error('originInFlight negative');
    for(const r of S.requests){ if(r.t0!=null && S.t-r.t0 > (r.patience||10)+1.001) throw new Error('stale request'); }
  }
  return {t:S.t, score:S.score};
}
for(const pol of ['lazy','novice','greedy']){
  const res=[];
  for(let s=1;s<=30;s++){ res.push(runBot(s*777+13,pol)); }
  const ts=res.map(r=>r.t).sort((a,b)=>a-b);
  const q=p=>ts[Math.min(ts.length-1,Math.floor(p*ts.length))];
  console.log(pol.padEnd(7),'p50',q(.5).toFixed(1),'p10',q(.1).toFixed(1),'p90',q(.9).toFixed(1));
}
let ok=0;
for(let s=1;s<=50;s++){ runBot(s*31+7, s%2?'greedy':'novice'); ok++; }
console.log('soak ok', ok+'/50');
