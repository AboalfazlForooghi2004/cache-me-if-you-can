// UNVERIFIED ON ARVAN. No persistent storage or replay validator is enabled.
function dailyAt(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get = k => parts.find(p => p.type === k).value;
  const date=get('year')+get('month')+get('day');
  let x=(Number(date)^0xC0FFEE)|0;
  x=Math.imul(x^(x>>>16),0x45d9f3b); x=Math.imul(x^(x>>>16),0x45d9f3b); x=(x^(x>>>16))>>>0;
  const jalali=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'long',day:'numeric'}).format(now);
  return {date,jalali,seed:x,headline:'امروز شبکه رو سریع‌تر کن!',verificationAvailable:false};
}
function jsonResponse(body,status) { return new Response(JSON.stringify(body), {status:status||200,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}); }
async function handleRequest(request) {
 try {
  const url = new URL(request.url);
  if (url.pathname === '/__diag' || url.pathname === '/__s3') return new Response('Not found',{status:404,headers:{'Cache-Control':'no-store'}});
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
  if (url.pathname === '/api/daily') { try {return jsonResponse(dailyAt(new Date()))} catch(e) {return jsonResponse({ok:false,message:'تاریخ تهران در دسترس نیست'},503)} }
  if (url.pathname.startsWith('/api/')) return jsonResponse({ok:false, message:'این قابلیت هنوز فعال نیست.'},503);
  return new Response('Not found', {status:404});
 } catch(e) { return new Response('{"error":"internal"}', {status:500,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}}); }
}
