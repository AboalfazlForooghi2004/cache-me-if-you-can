// Private build only. NEVER serve this source bundle; it contains build-time secrets.
// TRUSTED_CLIENT_IP_HEADER must be overwritten by a trusted edge proxy, not the client.
const privateStore=localRequire('./store').createS3Store(PRIVATE_CONFIG);
const privateService=localRequire('./online_service').createOnlineService({key:new TextEncoder().encode(PRIVATE_CONFIG.secret),store:privateStore,dailyAt,random:globalThis.crypto,subtle:globalThis.crypto&&globalThis.crypto.subtle});
async function privateHandle(request){
 try{
  const url=new URL(request.url);
  if(url.pathname==='/api/ping'&&request.method==='GET')return jsonResponse({ok:true,t:Date.now(),online:true});
  if(url.pathname==='/__diag'){
   const report=await diagnostics();report.validationMode='LITE';report.store='S3_CONFIGURED_NOT_VERIFIED';report.identity='header configured, trust not verified';report.conditionalWrites='not verified';report.listOrdering='not verified';report.storageLifecycle='not configured';report.replayVerification=false;
   try{const c=localRequire('./crypto_utils'),enc=new TextEncoder(),hex=x=>Array.from(x,b=>b.toString(16).padStart(2,'0')).join('');report.fallbackCryptoSelfTest={sha256:hex(c.sha256(enc.encode('abc')))==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',hmac:hex(c.hmacFallback(enc.encode('key'),enc.encode('The quick brown fox jumps over the lazy dog')))==='f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'}}catch(e){report.fallbackCryptoSelfTest={status:'failed'}}
   return jsonResponse(report);
  }
  if(['/api/start','/api/score','/api/leaderboard','/api/challenge'].includes(url.pathname))return privateService(request,request.headers.get(PRIVATE_CONFIG.identityHeader));
  return handleRequest(request);
 }catch(e){return jsonResponse({ok:false,error:'unavailable'},503)}
}
if(typeof addEventListener==='function')addEventListener('fetch',event=>event.respondWith(privateHandle(event.request)));
if(typeof module!=='undefined')module.exports={handleRequest:privateHandle,dailyAt};
