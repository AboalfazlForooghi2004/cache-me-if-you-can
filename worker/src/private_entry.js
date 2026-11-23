// Private bundle contains build-time secrets. Never serve this source as a static file.
// Proxy identity headers are deployment-dependent and may be spoofable.
const privateStore=localRequire('./store').createS3Store(PRIVATE_CONFIG);
const onlineModule=localRequire('./online_service');
const privateService=onlineModule.createOnlineService({key:new TextEncoder().encode(PRIVATE_CONFIG.secret),store:privateStore,dailyAt,random:globalThis.crypto,subtle:globalThis.crypto&&globalThis.crypto.subtle});
let diagCache=null,diagPending=null,diagTime=0,healthCache=null,healthTime=0,healthPending=null;
async function health(){const now=Date.now();if(healthCache!==null&&now>=healthTime&&now-healthTime<60000)return healthCache;if(!healthPending)healthPending=(async()=>{let timer;try{await Promise.race([privateStore.list('health/',1,{timeoutMs:2000}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),2000)})]);return true}catch(e){return false}finally{clearTimeout(timer)}})().then(v=>{healthCache=v;healthTime=Date.now();return v}).finally(()=>{healthPending=null});return healthPending}
async function privateHandle(request){
 try{const url=new URL(request.url);if(url.pathname==='/__diag'||url.pathname==='/__s3')return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
  if(url.pathname==='/api/ping'&&request.method==='GET')return jsonResponse({ok:true,t:Date.now(),online:await health()});
  if(['/api/start','/api/score','/api/leaderboard','/api/challenge'].includes(url.pathname)){let identity=null;for(const h of PRIVATE_CONFIG.identityHeaders){let value=request.headers.get(h);if(onlineModule.validIp(value)){identity=value;break}}return privateService(request,identity)}
  return handleRequest(request);
 }catch(e){return jsonResponse({ok:false,error:'unavailable'},503)}
}
if(typeof addEventListener==='function')addEventListener('fetch',event=>event.respondWith(privateHandle(event.request)));
if(typeof module!=='undefined')module.exports={handleRequest:privateHandle,dailyAt};
