'use strict';
// Prototype only: not wired into any deployed/public build. LITE is not replay verification.
const {issueTicket}=require('./tickets'),{validateAndConsume}=require('./lite_validation'),{normalizeNickname}=require('./nickname'),{hmacSha256}=require('./crypto_utils');
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true}),MAX_SCORE=1623000;
function json(data,status=200){return new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}})}
function validDate(s){if(typeof s!=='string'||!/^\d{8}$/.test(s))return false;const y=+s.slice(0,4),m=+s.slice(4,6),d=+s.slice(6,8),v=new Date(Date.UTC(y,m-1,d));return v.getUTCFullYear()===y&&v.getUTCMonth()===m-1&&v.getUTCDate()===d}
async function readJSON(req){if(!/^application\/json(?:\s*;|$)/i.test(req.headers.get('content-type')||''))throw Error('content type');if(!req.body)throw Error('empty');const reader=req.body.getReader();let chunks=[],size=0;for(;;){const x=await reader.read();if(x.done)break;size+=x.value.length;if(size>4096){await reader.cancel();throw Error('large')}chunks.push(x.value)}let bytes=new Uint8Array(size),i=0;for(const c of chunks){bytes.set(c,i);i+=c.length}return JSON.parse(dec.decode(bytes))}
function keyFor(date,score,nonce){return 'scores/'+date+'/'+String(MAX_SCORE-score).padStart(7,'0')+'/'+nonce}
function createOnlineService({key,store,dailyAt,random,subtle,now=()=>Math.floor(Date.now()/1000)}){
 if(!(key instanceof Uint8Array)||key.length<32||!store||typeof store.list!=='function'||typeof store.get!=='function'||typeof store.putIfAbsent!=='function'||typeof dailyAt!=='function')throw Error('Invalid configuration');
 async function rate(identity,time,scope,interval){if(typeof identity!=='string'||identity.length<1||identity.length>128||/[\x00-\x1f\x7f]/.test(identity))return null;const hash=await hmacSha256(key,enc.encode('rate-v1:'+identity),subtle),id=Array.from(hash.slice(0,16),x=>x.toString(16).padStart(2,'0')).join('');return store.putIfAbsent('rate/'+scope+'/'+Math.floor(time/interval)+'/'+id,'1')}
 return async function handle(request,trustedIdentity){try{
  const u=new URL(request.url),time=now();if(!Number.isSafeInteger(time))return json({ok:false,error:'unavailable'},503);
  if(u.pathname==='/api/start'&&request.method==='POST'){
   if(request.headers.get('origin')!==u.origin)return json({ok:false,error:'origin'},403);let body;try{body=await readJSON(request)}catch(e){return json({ok:false,error:'invalid'},400)}if(!body||Object.keys(body).length!==0)return json({ok:false,error:'invalid'},400);
   const allowed=await rate(trustedIdentity,time,'start',10);if(allowed===null)return json({ok:false,error:'unavailable'},503);if(!allowed)return json({ok:false,error:'rate'},429);
   const d=dailyAt(new Date(time*1000));if(!d||!validDate(d.date)||!Number.isSafeInteger(d.seed)||d.seed<0||d.seed>0xffffffff)return json({ok:false,error:'unavailable'},503);
   const token=await issueTicket({key,kind:'start',seed:d.seed,ttl:1200,now:time,random,subtle});return json({ok:true,date:d.date,seed:d.seed,token,validation:'LITE'});
  }
  if(u.pathname==='/api/score'&&request.method==='POST'){
   if(request.headers.get('origin')!==u.origin)return json({ok:false,error:'origin'},403);const allowed=await rate(trustedIdentity,time,'score',10);if(allowed===null)return json({ok:false,error:'unavailable'},503);if(!allowed)return json({ok:false,error:'rate'},429);let body;try{body=await readJSON(request)}catch(e){return json({ok:false,error:'invalid'},400)}
   if(!body||typeof body!=='object'||Array.isArray(body)||Object.keys(body).sort().join(',')!=='name,run,token'||typeof body.name!=='string'||typeof body.token!=='string')return json({ok:false,error:'invalid'},400);
   const name=body.name===''?'ناشناس':normalizeNickname(body.name);if(!name)return json({ok:false,error:'invalid'},400);
   const result=await validateAndConsume({key,token:body.token,run:body.run,now:time,store,subtle});if(!result.ok)return json({ok:false,error:result.reason},result.reason==='unavailable'?503:400);
   const d=dailyAt(new Date(result.ticket.iat*1000));if(!d||!validDate(d.date)||d.seed!==result.ticket.seed||body.run.score>MAX_SCORE)return json({ok:false,error:'invalid'},400);
   const record=JSON.stringify({name,score:body.run.score,date:d.date});const saved=await store.putIfAbsent(keyFor(d.date,body.run.score,result.ticket.nonce),record);if(!saved)return json({ok:false,error:'replayed'},400);return json({ok:true,date:d.date,validation:'LITE'});
  }
  if(u.pathname==='/api/leaderboard'&&request.method==='GET'){
   const allowed=await rate(trustedIdentity,time,'board',2);if(allowed===null)return json({ok:false,error:'unavailable'},503);if(!allowed)return json({ok:false,error:'rate'},429);const date=u.searchParams.get('date');if(!validDate(date))return json({ok:false,error:'invalid'},400);const prefix='scores/'+date+'/',keys=await store.list(prefix,100),records=[];let seen=new Set();
   for(const k of keys){const suffix=k.slice(prefix.length);if(!/^\d{7}\/[A-Za-z0-9_-]{22}$/.test(suffix))continue;const bytes=await store.get(k);if(!bytes||bytes.length>2048)continue;try{const r=JSON.parse(dec.decode(bytes)),n=normalizeNickname(r.name);if(!n||r.date!==date||!Number.isSafeInteger(r.score)||r.score<0||r.score>MAX_SCORE||keyFor(date,r.score,suffix.slice(8))!==k)continue;const id=n.toLowerCase();if(seen.has(id))continue;seen.add(id);records.push({name:n,score:r.score});if(records.length>=10)break}catch(e){continue}}
   return json({ok:true,date,entries:records,validation:'LITE',limitedToTop:100});
  }
  return json({ok:false,error:'not_found'},404);
 }catch(e){return json({ok:false,error:'unavailable'},503)}};
}
module.exports={createOnlineService,validDate,keyFor};
