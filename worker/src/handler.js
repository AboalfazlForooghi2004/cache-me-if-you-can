// UNVERIFIED ON ARVAN. No persistent storage or replay validator is enabled.
function dailyAt(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get = k => parts.find(p => p.type === k).value;
  const date=get('year')+get('month')+get('day');
  let x=(Number(date)^0xC0FFEE)|0;
  x=Math.imul(x^(x>>>16),0x45d9f3b); x=Math.imul(x^(x>>>16),0x45d9f3b); x=(x^(x>>>16))>>>0;
  const jalali=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'long',day:'numeric'}).format(now);
  return {date,jalali,seed:x,simVersion:null,headline:'امروز شبکه رو سریع‌تر کن!',verificationAvailable:false};
}
function jsonResponse(body,status) { return new Response(JSON.stringify(body), {status:status||200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}); }
async function diagnostics() {
  const report={buildId:BUILD_ID,simVersion:null,validationMode:'NONE',store:'NONE',arvanStatus:'UNVERIFIED ON ARVAN',features:{},clocks:{},cryptoSelfTest:{status:'unavailable'},simBenchmark:{status:'not implemented'},outbound:{status:'not configured'},storeSelfTest:{status:'not configured'},listOrdering:{status:'not configured'}};
  function probe(name,fn){try{report.features[name]=fn()}catch(e){report.features[name]='probe failed'}}
  probe('crypto.subtle',()=>typeof crypto==='object' && crypto!==null ? typeof crypto.subtle:'undefined');
  probe('TextEncoder',()=>typeof TextEncoder);probe('performance',()=>typeof performance);
  probe('Intl',()=>typeof Intl);probe('structuredClone',()=>typeof structuredClone);
  probe('CompressionStream',()=>typeof CompressionStream);probe('caches',()=>typeof caches);
  try{const a=Date.now();let x=0;for(let i=0;i<100000;i++)x=(x+i)|0;report.clocks.dateElapsedMs=Date.now()-a;report.clocks.loopChecksum=x}catch(e){report.clocks.dateError='unavailable'}
  try{if(typeof performance!=='undefined'&&typeof performance.now==='function'){const a=performance.now();let x=0;for(let i=0;i<100000;i++)x=(x+i)|0;report.clocks.performanceElapsedMs=performance.now()-a}}catch(e){report.clocks.performanceError='unavailable'}
  try{report.tehranDate=dailyAt(new Date()).date}catch(e){report.tehranDate=null}
  try{
   if(typeof crypto!=='undefined'&&crypto.subtle&&typeof TextEncoder!=='undefined'){
    const enc=new TextEncoder();const bytes=enc.encode('abc');
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    const hex=Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,'0')).join('');
    const key=await crypto.subtle.importKey('raw',enc.encode('key'),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const sig=await crypto.subtle.sign('HMAC',key,enc.encode('The quick brown fox jumps over the lazy dog'));
    const hm=Array.from(new Uint8Array(sig),x=>x.toString(16).padStart(2,'0')).join('');
    report.cryptoSelfTest={sha256:hex==='ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',hmac:hm==='f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8'};
   }
  }catch(e){report.cryptoSelfTest={status:'failed'}}
  return report;
}
async function handleRequest(request) {
 try {
  const url = new URL(request.url);
  if (request.method === 'HEAD' && url.pathname === '/') return new Response(null,{status:200,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{'Allow':'GET'}});
  if (url.pathname === '/') return new Response(INDEX_HTML, {headers:{'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'}});
  if (url.pathname === '/og.png') {
   if(!OG_BASE64)return new Response('Not found',{status:404});
   if(typeof atob!=='function')return new Response('Unavailable',{status:503});
   const raw=atob(OG_BASE64), bytes=new Uint8Array(raw.length);
   for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
   return new Response(bytes,{headers:{'Content-Type':'image/png','Cache-Control':'public, max-age=86400'}});
  }
  if (url.pathname === '/api/ping') return jsonResponse({ok:true,t:Date.now(),online:false});
  if (url.pathname === '/__diag') { const report=await diagnostics();report.requestHeaderNames=Array.from(request.headers.keys()).map(h=>h.toLowerCase()).sort();report.identityHeaderPresent=false;report.onlineConfigured=false;return jsonResponse(report); }
  if (url.pathname === '/api/daily') { try {return jsonResponse(dailyAt(new Date()))} catch(e) {return jsonResponse({ok:false,message:'تاریخ تهران در دسترس نیست'},503)} }
  if (url.pathname.startsWith('/api/')) return jsonResponse({ok:false, message:'این قابلیت هنوز فعال نیست.'},503);
  return new Response('Not found', {status:404});
 } catch(e) { return new Response('{"error":"internal"}', {status:500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}); }
}
