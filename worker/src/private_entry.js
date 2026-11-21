// Private bundle contains build-time secrets. Never serve this source as a static file.
// Proxy identity headers are deployment-dependent and may be spoofable.
const privateStore=localRequire('./store').createS3Store(PRIVATE_CONFIG);
const onlineModule=localRequire('./online_service');
const privateService=onlineModule.createOnlineService({key:new TextEncoder().encode(PRIVATE_CONFIG.secret),store:privateStore,dailyAt,random:globalThis.crypto,subtle:globalThis.crypto&&globalThis.crypto.subtle});
let diagCache=null,diagPending=null,diagTime=0;
async function storageDiagnostic(){
 const out={put:'unsupported',get:'unsupported',listOrdering:'unsupported',conditionalCreate:'unsupported',delete:'unsupported'};let keys=[];
 try{if(!globalThis.crypto||!crypto.getRandomValues)return out;let a=new Uint8Array(12);crypto.getRandomValues(a);const id=Array.from(a,x=>x.toString(16).padStart(2,'0')).join(''),prefix='diag/'+id+'/';keys=['a','b','c'].map(x=>prefix+x);
  try{for(const k of keys)if(!await privateStore.putIfAbsent(k,'diag'))throw Error('put');out.put='pass'}catch(e){out.put='fail';return out}
  try{let bytes=await privateStore.get(keys[0]);out.get=bytes&&new TextDecoder().decode(bytes)==='diag'?'pass':'fail'}catch(e){out.get='fail'}
  try{let listed=await privateStore.list(prefix,3);out.listOrdering=JSON.stringify(listed)===JSON.stringify(keys)?'pass':'fail'}catch(e){out.listOrdering='fail'}
  try{out.conditionalCreate=await privateStore.putIfAbsent(keys[0],'diag-again')?'unsupported':'pass'}catch(e){out.conditionalCreate='fail'}
 }finally{if(keys.length){try{for(const k of keys)await privateStore.delete(k);out.delete='pass'}catch(e){out.delete='fail'}}}return out;
}
async function privateHandle(request){
 try{const url=new URL(request.url);
  if(url.pathname==='/api/ping'&&request.method==='GET')return jsonResponse({ok:true,t:Date.now(),online:true});
  if(url.pathname==='/__diag'&&request.method==='GET'){
   const report=await diagnostics();report.validationMode='LITE';report.store='S3_CONFIGURED_NOT_VERIFIED';report.onlineConfigured=true;report.arvanStatus='UNVERIFIED ON ARVAN';report.identityHeaderPresent=PRIVATE_CONFIG.identityHeaders.some(h=>request.headers.has(h));report.requestHeaderNames=Array.from(request.headers.keys()).map(h=>h.toLowerCase()).sort();report.storageLifecycle='not configured';report.replayVerification=false;
   try{const c=localRequire('./crypto_utils'),enc=new TextEncoder(),hex=x=>Array.from(x,b=>b.toString(16).padStart(2,'0')).join('');report.fallbackCryptoSelfTest={sha256:hex(c.sha256(enc.encode('abc')))==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',hmac:hex(c.hmacFallback(enc.encode('key'),enc.encode('The quick brown fox jumps over the lazy dog')))==='f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'}}catch(e){report.fallbackCryptoSelfTest={status:'failed'}}
   if(!diagCache||Date.now()-diagTime>60000){if(!diagPending)diagPending=storageDiagnostic().finally(()=>{diagPending=null});diagCache=await diagPending;diagTime=Date.now()}report.storeSelfTest=diagCache;return jsonResponse(report);
  }
  if(['/api/start','/api/score','/api/leaderboard','/api/challenge'].includes(url.pathname)){let identity=null;for(const h of PRIVATE_CONFIG.identityHeaders){let value=request.headers.get(h);if(onlineModule.validIp(value)){identity=value;break}}return privateService(request,identity)}
  return handleRequest(request);
 }catch(e){return jsonResponse({ok:false,error:'unavailable'},503)}
}
if(typeof addEventListener==='function')addEventListener('fetch',event=>event.respondWith(privateHandle(event.request)));
if(typeof module!=='undefined')module.exports={handleRequest:privateHandle,dailyAt};
