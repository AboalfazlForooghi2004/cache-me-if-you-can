// Private build only. NEVER serve this source bundle; it contains build-time secrets.
// TRUSTED_CLIENT_IP_HEADER must be overwritten by a trusted edge proxy, not the client.
const privateStore=localRequire('./store').createS3Store(PRIVATE_CONFIG);
const privateService=localRequire('./online_service').createOnlineService({key:new TextEncoder().encode(PRIVATE_CONFIG.secret),store:privateStore,dailyAt,random:globalThis.crypto,subtle:globalThis.crypto&&globalThis.crypto.subtle});
async function privateHandle(request){
 try{
  const url=new URL(request.url);
  if(url.pathname==='/__diag')return jsonResponse({buildId:BUILD_ID,validationMode:'LITE',store:'S3_CONFIGURED_NOT_VERIFIED',arvanStatus:'UNVERIFIED ON ARVAN',identity:'header configured, trust not verified',conditionalWrites:'not verified',listOrdering:'not verified',storageLifecycle:'not configured',replayVerification:false});
  if(['/api/start','/api/score','/api/leaderboard','/api/challenge'].includes(url.pathname))return privateService(request,request.headers.get(PRIVATE_CONFIG.identityHeader));
  return handleRequest(request);
 }catch(e){return jsonResponse({ok:false,error:'unavailable'},503)}
}
if(typeof addEventListener==='function')addEventListener('fetch',event=>event.respondWith(privateHandle(event.request)));
if(typeof module!=='undefined')module.exports={handleRequest:privateHandle,dailyAt};
