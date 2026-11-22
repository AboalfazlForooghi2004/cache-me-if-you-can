// Runtime configuration: never include the owner values in generated artifacts or responses.
const onlineModule=localRequire('./online_service');
const ENV_NAMES=['CMIYC_PROBE','CMIYC_CONFIG','S3_ENDPOINT','S3_REGION','S3_BUCKET','S3_ACCESS_KEY','S3_SECRET_KEY','S3_PATH_STYLE','WORKER_SECRET','TRUSTED_CLIENT_IP_HEADER'];
// Guard every bare identifier independently; some hosts expose lexical bindings, not properties.
const bareReaders={
 CMIYC_PROBE:()=>typeof CMIYC_PROBE!=='undefined'?CMIYC_PROBE:undefined,
 CMIYC_CONFIG:()=>typeof CMIYC_CONFIG!=='undefined'?CMIYC_CONFIG:undefined,
 S3_ENDPOINT:()=>typeof S3_ENDPOINT!=='undefined'?S3_ENDPOINT:undefined,
 S3_REGION:()=>typeof S3_REGION!=='undefined'?S3_REGION:undefined,
 S3_BUCKET:()=>typeof S3_BUCKET!=='undefined'?S3_BUCKET:undefined,
 S3_ACCESS_KEY:()=>typeof S3_ACCESS_KEY!=='undefined'?S3_ACCESS_KEY:undefined,
 S3_SECRET_KEY:()=>typeof S3_SECRET_KEY!=='undefined'?S3_SECRET_KEY:undefined,
 S3_PATH_STYLE:()=>typeof S3_PATH_STYLE!=='undefined'?S3_PATH_STYLE:undefined,
 WORKER_SECRET:()=>typeof WORKER_SECRET!=='undefined'?WORKER_SECRET:undefined,
 TRUSTED_CLIENT_IP_HEADER:()=>typeof TRUSTED_CLIENT_IP_HEADER!=='undefined'?TRUSTED_CLIENT_IP_HEADER:undefined
};
function readEnv(name,event,envArg){
 const readers=[['global',()=>globalThis[name]],['bare',()=>bareReaders[name]()],['event.env',()=>event&&event.env&&event.env[name]],['env',()=>(envArg||(event&&!event.request&&!event.respondWith?event:null))&&((envArg||(event&&!event.request&&!event.respondWith?event:null))[name])],['env',()=>globalThis.env&&globalThis.env[name]],['ENV',()=>globalThis.ENV&&globalThis.ENV[name]]];
 for(const [via,get] of readers)try{const value=get();if(value!==undefined&&value!==null)return {value,via}}catch(e){}
 return {value:undefined,via:'none'};
}
function probeEnv(v){let type=v===null?'other':typeof v==='string'?'string':typeof v==='object'?'object':'other',length=0;try{if(type==='string')length=v.length;else if(type==='object')length=Object.keys(v).length}catch(e){}return {found:v!==undefined&&v!==null,via:'none',type,length}}
const GLOBAL_BASELINE=new Set(('Object Function Array Number parseFloat parseInt Infinity NaN undefined Boolean String Symbol Date Promise RegExp Error AggregateError EvalError RangeError ReferenceError SyntaxError TypeError URIError globalThis JSON Math Intl ArrayBuffer Uint8Array Int8Array Uint8ClampedArray Int16Array Uint16Array Int32Array Uint32Array Float32Array Float64Array BigInt64Array BigUint64Array DataView Map BigInt Set WeakMap WeakSet WeakRef FinalizationRegistry Proxy Reflect decodeURI decodeURIComponent encodeURI encodeURIComponent escape unescape eval isFinite isNaN console performance crypto fetch Request Response Headers URL URLSearchParams TextEncoder TextDecoder AbortController AbortSignal ReadableStream WritableStream TransformStream CompressionStream DecompressionStream atob btoa setTimeout clearTimeout setInterval clearInterval queueMicrotask structuredClone addEventListener removeEventListener dispatchEvent self navigator caches WebAssembly WebSocket Blob File FormData Event EventTarget DOMException global process Buffer module exports require __filename __dirname').split(' '));
function extraGlobals(){try{return Object.getOwnPropertyNames(globalThis).filter(n=>!GLOBAL_BASELINE.has(n)&&/^[A-Za-z_$][A-Za-z0-9_$]{0,79}$/.test(n)).sort().slice(0,80)}catch(e){return []}}
function configSnapshot(event,envArg){
 let values={},probes={};for(const name of ENV_NAMES){let item=readEnv(name,event,envArg),p=probeEnv(item.value);p.via=item.via;values[name]=item.value;probes[name]=p}
 let raw=values.CMIYC_CONFIG,parsed=false,obj=null,problems=[];
 try{if(raw!==undefined){if(typeof raw==='string'){if(new TextEncoder().encode(raw).length>8192)problems.push('config_too_large');else{obj=JSON.parse(raw);parsed=true}}else if(raw&&typeof raw==='object'&&!Array.isArray(raw)){const encoded=JSON.stringify(raw);if(typeof encoded!=='string'||new TextEncoder().encode(encoded).length>8192)problems.push('config_too_large');else{obj=raw;parsed=true}}else problems.push('config_type');if(!obj||typeof obj!=='object'||Array.isArray(obj)){obj=null;if(!problems.length)problems.push('config_type')}}}catch(e){obj=null;problems.push('config_json')}
 // An invalid present primary config fails closed instead of silently mixing credentials.
 let primary=raw!==undefined;const pick=(field,fallback)=>primary?(obj&&obj[field]):values[fallback];
 let endpoint=pick('s3Endpoint','S3_ENDPOINT'),region=pick('s3Region','S3_REGION'),bucket=pick('s3Bucket','S3_BUCKET'),accessKey=pick('s3AccessKey','S3_ACCESS_KEY'),secretKey=pick('s3SecretKey','S3_SECRET_KEY'),secret=pick('workerSecret','WORKER_SECRET'),pathStyle=pick('s3PathStyle','S3_PATH_STYLE'),headers=pick('identityHeaders','TRUSTED_CLIENT_IP_HEADER');
 if(typeof endpoint!=='string'||!endpoint)problems.push('missing_endpoint');else try{let u=new URL(endpoint);if(u.protocol!=='https:'||u.username||u.password||u.search||u.hash||u.pathname!=='/')problems.push('invalid_endpoint')}catch(e){problems.push('invalid_endpoint')}
 if(typeof region!=='string'||!region)problems.push('missing_region');else if(!/^[A-Za-z0-9-]{1,64}$/.test(region))problems.push('invalid_region');
 if(typeof bucket!=='string'||!bucket)problems.push('missing_bucket');else if(!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket))problems.push('invalid_bucket');
 if(typeof accessKey!=='string'||!accessKey)problems.push('missing_access_key');else if(!/^[A-Za-z0-9_-]{1,128}$/.test(accessKey))problems.push('invalid_access_key');
 if(typeof secretKey!=='string'||!secretKey)problems.push('missing_secret_key');
 if(typeof secret!=='string'||!secret)problems.push('missing_worker_secret');else if(new TextEncoder().encode(secret).length<32)problems.push('invalid_worker_secret');
 if(pathStyle===undefined||pathStyle===null||pathStyle==='')pathStyle=true;else if(pathStyle===true||pathStyle==='true'||pathStyle==='1'||pathStyle===1)pathStyle=true;else if(pathStyle===false||pathStyle==='false'||pathStyle==='0'||pathStyle===0)pathStyle=false;else problems.push('invalid_path_style');
 if(headers===undefined||headers===null||headers==='')headers=['x-real-ip'];else if(typeof headers==='string')headers=headers.split(',').map(x=>x.trim());
 if(!Array.isArray(headers)||!headers.length||headers.length>16||!headers.every(h=>typeof h==='string'&&/^[a-z0-9-]{1,64}$/.test(h)&&!['host','origin','referer','cookie','authorization','user-agent'].includes(h)))problems.push('invalid_identity_headers');
 return {env:{probe:probes,configValid:problems.length===0,problems,extraGlobals:extraGlobals(),parsed},config:problems.length?null:{endpoint,region,bucket,accessKey,secretKey,secret,pathStyle,identityHeaders:headers}};
}
let runtimeState=null,runtimeAt=0;
function stateFor(event,envArg){let now=Date.now();if(runtimeState&&now>=runtimeAt&&now-runtimeAt<60000)return runtimeState;let snap;try{snap=configSnapshot(event,envArg)}catch(e){snap={env:{probe:{},configValid:false,problems:['invalid_config'],extraGlobals:extraGlobals(),parsed:false},config:null}}runtimeAt=now;if(runtimeState&&snap.config&&runtimeState.config&&JSON.stringify(snap.config)===JSON.stringify(runtimeState.config)){runtimeState.env=snap.env;return runtimeState}runtimeState={env:snap.env,config:snap.config,healthCache:null,healthTime:0,healthPending:null,diagCache:null,diagTime:0,diagPending:null};if(snap.config){try{runtimeState.store=localRequire('./store').createS3Store(snap.config);runtimeState.service=onlineModule.createOnlineService({key:new TextEncoder().encode(snap.config.secret),store:runtimeState.store,dailyAt,random:globalThis.crypto,subtle:globalThis.crypto&&globalThis.crypto.subtle})}catch(e){runtimeState.env.configValid=false;runtimeState.env.problems.push('invalid_config');runtimeState.config=null}}return runtimeState}
async function runtimeHealth(st){if(!st.config)return false;const now=Date.now();if(st.healthCache!==null&&now>=st.healthTime&&now-st.healthTime<60000)return st.healthCache;if(!st.healthPending)st.healthPending=(async()=>{let timer;try{await Promise.race([st.store.list('health/',1,{timeoutMs:2000}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('timeout')),2000)})]);return true}catch(e){return false}finally{clearTimeout(timer)}})().then(v=>{st.healthCache=v;st.healthTime=Date.now();return v}).finally(()=>{st.healthPending=null});return st.healthPending}
async function runtimeDiagnostic(st){
 const out={put:'unsupported',get:'unsupported',listOrdering:'unsupported',conditionalCreate:'unsupported',delete:'unsupported'};let keys=[];const store=st.store;
 try{if(!globalThis.crypto||!globalThis.crypto.getRandomValues)return out;let a=new Uint8Array(12);globalThis.crypto.getRandomValues(a);const id=Array.from(a,x=>x.toString(16).padStart(2,'0')).join(''),prefix='diag/'+id+'/';keys=['a','b','c'].map(x=>prefix+x);
  try{for(const k of keys)if(!await store.putIfAbsent(k,'diag'))throw Error('put');out.put='pass'}catch(e){out.put='fail';return out}
  try{let bytes=await store.get(keys[0]);out.get=bytes&&new TextDecoder().decode(bytes)==='diag'?'pass':'fail'}catch(e){out.get='fail'}
  try{let listed=await store.list(prefix,3);out.listOrdering=JSON.stringify(listed)===JSON.stringify(keys)?'pass':'fail'}catch(e){out.listOrdering='fail'}
  try{let created=await store.putIfAbsent(keys[0],'diag-again');out.conditionalCreate=created||store.conditionalUnsupported()?'unsupported':'pass'}catch(e){out.conditionalCreate='fail'}
 }finally{if(keys.length){try{for(const k of keys)await store.delete(k);out.delete='pass'}catch(e){out.delete='fail'}}}return out;
}
async function runtimeHandle(request,event,envArg){
 try{const url=new URL(request.url);if(url.pathname==='/'||url.pathname==='/og.png'||url.pathname==='/api/daily'||(!url.pathname.startsWith('/api/')&&url.pathname!=='/__diag'))return handleRequest(request);
 const st=stateFor(event,envArg);
 if(url.pathname==='/api/ping'&&request.method==='GET')return jsonResponse({ok:true,t:Date.now(),online:await runtimeHealth(st)});
 if(url.pathname==='/__diag'&&request.method==='GET'){
  const report=await diagnostics();report.env=st.env;report.onlineConfigured=!!st.config;report.requestHeaderNames=Array.from(request.headers.keys()).map(h=>h.toLowerCase()).sort();report.identityHeaderPresent=!!st.config&&st.config.identityHeaders.some(h=>request.headers.has(h));report.replayVerification=false;report.health={online:await runtimeHealth(st),cacheSeconds:60};
  if(st.config){report.validationMode='LITE';report.store='S3_CONFIGURED_NOT_VERIFIED';if(!st.diagCache||Date.now()-st.diagTime>60000){if(!st.diagPending)st.diagPending=runtimeDiagnostic(st).finally(()=>{st.diagPending=null});st.diagCache=await st.diagPending;st.diagTime=Date.now()}report.storeSelfTest=st.diagCache;report.addressingStyle=st.store.getAddressingStyle();report.nonceGuarantee=st.diagCache.conditionalCreate==='pass'?'conditional create observed; not verified across isolates':'best-effort GET then PUT; not atomic across isolates'}else{report.storeSelfTest={status:'not configured'};report.addressingStyle='none';report.nonceGuarantee='unavailable'}return jsonResponse(report)
 }
 if(st.config&&['/api/start','/api/score','/api/leaderboard','/api/challenge'].includes(url.pathname)){let identity=null;for(const h of st.config.identityHeaders){let value=request.headers.get(h);if(onlineModule.validIp(value)){identity=value;break}}return st.service(request,identity)}
 return handleRequest(request);
 }catch(e){if(!request||!request.url||!/^https?:/i.test(String(request.url)))return handleRequest(request);return jsonResponse({ok:false,error:'unavailable'},503)}
}
if(typeof addEventListener==='function')addEventListener('fetch',event=>event.respondWith(runtimeHandle(event.request,event)));
if(typeof module!=='undefined')module.exports={handleRequest:runtimeHandle,fetch:(request,env)=>runtimeHandle(request,null,env),dailyAt};
