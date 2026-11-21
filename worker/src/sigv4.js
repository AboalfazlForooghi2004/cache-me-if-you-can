'use strict';
// Isolated S3 Signature V4 primitive. Not wired into the public worker.
// Requires a WebCrypto SubtleCrypto implementation and does not log credentials.
const encoder=new TextEncoder();
const utf8=s=>encoder.encode(s);
const hex=bytes=>Array.from(new Uint8Array(bytes),x=>x.toString(16).padStart(2,'0')).join('');
function awsEncode(s){return encodeURIComponent(s).replace(/[!'()*]/g,c=>'%'+c.charCodeAt(0).toString(16).toUpperCase())}
function canonicalPath(path){return path.split('/').map(part=>awsEncode(decodeURIComponent(part))).join('/')||'/'}
function canonicalQuery(params){const pairs=[];for(const [k,v] of params)pairs.push([awsEncode(k),awsEncode(v)]);pairs.sort((a,b)=>a[0]<b[0]?-1:a[0]>b[0]?1:a[1]<b[1]?-1:a[1]>b[1]?1:0);return pairs.map(p=>p[0]+'='+p[1]).join('&')}
async function sha(subtle,data){return hex(await subtle.digest('SHA-256',data))}
async function hmac(subtle,key,data){const k=await subtle.importKey('raw',key,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await subtle.sign('HMAC',k,utf8(data)))}
async function signS3Request({method,url,headers={},body='',accessKey,secretKey,region,now=new Date(),subtle=globalThis.crypto&&globalThis.crypto.subtle}){
 if(!subtle||!accessKey||!secretKey||!region)throw new Error('Missing signing configuration');
 const u=new URL(url);if(u.protocol!=='https:'||u.username||u.password||u.hash)throw new Error('Invalid S3 URL');
 if(!/^(GET|PUT|DELETE|HEAD)$/.test(method))throw new Error('Unsupported method');
 const bytes=typeof body==='string'?utf8(body):body instanceof Uint8Array?body:null;if(!bytes)throw new Error('Unsupported body');
 if((method==='GET'||method==='HEAD')&&bytes.length)throw new Error('GET or HEAD body is not supported');
 const iso=now.toISOString().replace(/[:-]|\.\d{3}/g,''),day=iso.slice(0,8),payloadHash=await sha(subtle,bytes);
 const hs={};for(const [k,v] of Object.entries(headers)){const n=k.toLowerCase();if(!/^[a-z0-9-]+$/.test(n)||n==='authorization'||n==='host'||n==='x-amz-date'||n==='x-amz-content-sha256'||n in hs)throw new Error('Invalid or duplicate header');const value=String(v);if(/[\r\n]/.test(value))throw new Error('Invalid header value');hs[n]=value.trim().replace(/\s+/g,' ')}
 hs.host=u.host;hs['x-amz-date']=iso;hs['x-amz-content-sha256']=payloadHash;
 const names=Object.keys(hs).sort(),signedNames=names.join(';'),canonicalHeaders=names.map(n=>n+':'+hs[n]+'\n').join('');
 const canonical=[method,canonicalPath(u.pathname),canonicalQuery(u.searchParams),canonicalHeaders,signedNames,payloadHash].join('\n');
 const scope=day+'/'+region+'/s3/aws4_request';const stringToSign='AWS4-HMAC-SHA256\n'+iso+'\n'+scope+'\n'+await sha(subtle,utf8(canonical));
 const kDate=await hmac(subtle,utf8('AWS4'+secretKey),day),kRegion=await hmac(subtle,kDate,region),kService=await hmac(subtle,kRegion,'s3'),kSigning=await hmac(subtle,kService,'aws4_request');
 const signature=hex(await hmac(subtle,kSigning,stringToSign));
 const outgoing={...hs,authorization:'AWS4-HMAC-SHA256 Credential='+accessKey+'/'+scope+', SignedHeaders='+signedNames+', Signature='+signature};delete outgoing.host;
 return {url:u.href,method,headers:outgoing,body:bytes};
}
if(typeof module!=='undefined')module.exports={signS3Request,canonicalPath,canonicalQuery};
