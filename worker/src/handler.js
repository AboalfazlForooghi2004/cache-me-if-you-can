// UNVERIFIED ON ARVAN. No persistent storage or production leaderboard is enabled.
function dailyAt(now) {
  const parts = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const get = k => parts.find(p => p.type === k).value;
  const date=get('year')+get('month')+get('day');
  let x=(Number(date)^0xC0FFEE)|0;
  x=Math.imul(x^(x>>>16),0x45d9f3b); x=Math.imul(x^(x>>>16),0x45d9f3b); x=(x^(x>>>16))>>>0;
  const jalali=new Intl.DateTimeFormat('fa-IR-u-ca-persian',{timeZone:'Asia/Tehran',year:'numeric',month:'long',day:'numeric'}).format(now);
  return {date,jalali,seed:x,simVersion:null,headline:'امروز شبکه رو سریع‌تر کن!',verificationAvailable:false};
}
async function handleRequest(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{'Allow':'GET'}});
  if (url.pathname === '/') return new Response(INDEX_HTML, {headers:{'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'}});
  if (url.pathname === '/api/ping') return new Response(JSON.stringify({ok:true,t:Date.now()}), {headers:{'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}});
  if (url.pathname === '/api/daily') { try {return new Response(JSON.stringify(dailyAt(new Date())),{headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})} catch(e) {return new Response(JSON.stringify({ok:false,message:'تاریخ تهران در دسترس نیست'}),{status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}})} }
  if (url.pathname.startsWith('/api/')) return new Response(JSON.stringify({ok:false, message:'این قابلیت هنوز فعال نیست.'}), {status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  return new Response('Not found', {status:404});
}
