'use strict';
// Standalone heuristic validation. It is not replay verification or proof of legitimate play.
const {verifyTicket}=require('./tickets');
const recentNonces=new Map();
function plausibleRun(run,ticket,now){
 if(!run||typeof run!=='object'||!ticket||ticket.kind!=='start'||!Number.isSafeInteger(now))return false;
 const {seed,score,served,fastCount,maxCombo,timeouts,duration}=run;
 if(!Number.isSafeInteger(seed)||seed!==ticket.seed||!Number.isSafeInteger(score)||!Number.isSafeInteger(served)||!Number.isSafeInteger(fastCount)||!Number.isSafeInteger(maxCombo)||!Number.isSafeInteger(timeouts)||!Number.isFinite(duration))return false;
 if(duration<1||duration>900||duration>now-ticket.iat+5||score<0||served<0||fastCount<0||timeouts<0||maxCombo<0)return false;
 if(fastCount>served||maxCombo>fastCount||served+timeouts>Math.ceil(duration*20)+40)return false;
 // Deliberately broad: no guarantee of rejecting plausible fabricated statistics.
 if(score>Math.ceil(duration*1800)+3000)return false;
 // Conservative ceiling on per-request points plus wave rewards; not proof of honest play.
 if(score>served*1350+(Math.floor(duration/28)+1)*600)return false;
 return true;
}
async function validateAndConsume({key,token,run,now=Math.floor(Date.now()/1000),store,subtle}){
 if(!store||(typeof store.singlePut!=='function'&&typeof store.putIfAbsent!=='function'))return {ok:false,reason:'unavailable'};
 let ticket;try{ticket=await verifyTicket({key,kind:'start',token,now,subtle})}catch(e){return {ok:false,reason:'unavailable'}}
 if(!ticket||!plausibleRun(run,ticket,now))return {ok:false,reason:'invalid'};
 try{for(const [n,expiry] of recentNonces){if(expiry<=now)recentNonces.delete(n)}if(recentNonces.has(ticket.nonce))return {ok:false,reason:'replayed'};if(recentNonces.size>=10000)return {ok:false,reason:'unavailable'};recentNonces.set(ticket.nonce,ticket.exp);const k='nonce/'+ticket.nonce;const created=typeof store.singlePut==='function'?await store.singlePut(k,'1',false):await store.putIfAbsent(k,'1');return created?{ok:true,ticket}:{ok:false,reason:'replayed'}}catch(e){return {ok:false,reason:'unavailable',stage:'nonce'}}
}
module.exports={plausibleRun,validateAndConsume};
