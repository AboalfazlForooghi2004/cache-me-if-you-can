// UNVERIFIED ON ARVAN. No persistent storage or production leaderboard is enabled.
async function handleRequest(request) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return new Response('Method not allowed', {status:405, headers:{'Allow':'GET'}});
  if (url.pathname === '/') return new Response(INDEX_HTML, {headers:{'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff'}});
  if (url.pathname === '/api/ping') return new Response(JSON.stringify({ok:true,t:Date.now()}), {headers:{'Content-Type':'application/json; charset=utf-8', 'Cache-Control':'no-store'}});
  if (url.pathname.startsWith('/api/')) return new Response(JSON.stringify({ok:false, message:'این قابلیت هنوز فعال نیست.'}), {status:503,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}});
  return new Response('Not found', {status:404});
}
