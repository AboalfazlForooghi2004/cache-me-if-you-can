'use strict';
// Standalone heuristic validation. It is not replay verification or proof of legitimate play.
const {verifyTicket}=require('./tickets');
function plausibleRun(run,ticket,now){
 if(!run||typeof run!=='object'||!ticket||ticket.kind!=='start'||!Number.isSafeInteger(now))return false;
 const {seed,score,served,fastCount,maxCombo,timeouts,duration}=run;
 if(!Number.isSafeInteger(seed)||seed!==ticket.seed||!Number.isSafeInteger(score)||!Number.isSafeInteger(served)||!Number.isSafeInteger(fastCount)||!Number.isSafeInteger(maxCombo)||!Number.isSafeInteger(timeouts)||!Number.isFinite(duration))return false;
 if(duration<1||duration>900||duration>now-ticket.iat+5||score<0||served<0||fastCount<0||timeouts<0||maxCombo<0)return false;
 if(fastCount>served||maxCombo>fastCount||served+timeouts>Math.ceil(duration*20)+40)return false;
 // Deliberately broad: no guarantee of rejecting plausible fabricated statistics.
 if(score>Math.ceil(duration*1800)+3000)return false;
 return true;
}
async function validateAndConsume({key,token,run,now=Math.floor(Date.now()/1000),store,subtle}){
 if(!store||typeof store.putIfAbsent!=='function')return {ok:false,reason:'unavailable'};
 let ticket;try{ticket=await verifyTicket({key,kind:'start',token,now,subtle})}catch(e){return {ok:false,reason:'unavailable'}}
 if(!ticket||!plausibleRun(run,ticket,now))return {ok:false,reason:'invalid'};
 try{const created=await store.putIfAbsent('nonce/'+ticket.nonce,'1');return created?{ok:true,ticket}:{ok:false,reason:'replayed'}}catch(e){return {ok:false,reason:'unavailable'}}
}
module.exports={plausibleRun,validateAndConsume};
