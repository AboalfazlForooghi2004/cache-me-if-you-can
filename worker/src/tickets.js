'use strict';
// Standalone purpose-bound signed ticket building block, not an active endpoint.
const {hmacSha256,equalBytes}=require('./crypto_utils');
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
function b64(bytes){let s='';for(const b of bytes)s+=String.fromCharCode(b);return btoa(s).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_')}
function unb64(s){if(!/^[A-Za-z0-9_-]+$/.test(s)||s.length%4===1)throw new Error('Invalid token');let raw=atob(s.replace(/-/g,'+').replace(/_/g,'/')+'='.repeat((4-s.length%4)%4)),v=Uint8Array.from(raw,c=>c.charCodeAt(0));if(b64(v)!==s)throw new Error('Invalid token');return v}
function config(key,kind){if(!(key instanceof Uint8Array)||key.length<32||!['start','challenge'].includes(kind))throw new Error('Invalid ticket configuration')}
function fields(p,kind,now){return p&&Object.keys(p).sort().join(',')==='date,exp,iat,kind,nonce,ref,seed,v'&&p.v===1&&p.kind===kind&&Number.isSafeInteger(p.seed)&&p.seed>=0&&p.seed<=0xffffffff&&Number.isSafeInteger(p.iat)&&Number.isSafeInteger(p.exp)&&p.exp>p.iat&&p.exp-p.iat<=86400&&p.iat<=now+30&&p.exp>now&&typeof p.date==='string'&&/^(?:|\d{8})$/.test(p.date)&&typeof p.ref==='string'&&/^(?:|[A-Za-z0-9_-]{22})$/.test(p.ref)&&typeof p.nonce==='string'&&/^[A-Za-z0-9_-]{22}$/.test(p.nonce)}
async function issueTicket({key,kind,seed,date='',ref='',ttl=900,now=Math.floor(Date.now()/1000),random=globalThis.crypto,subtle=globalThis.crypto&&globalThis.crypto.subtle}){
 config(key,kind);if(!random||typeof random.getRandomValues!=='function')throw new Error('Secure randomness unavailable');if(!Number.isSafeInteger(now)||!Number.isSafeInteger(ttl)||ttl<1||ttl>86400||!Number.isSafeInteger(seed)||seed<0||seed>0xffffffff||typeof date!=='string'||!/^(?:|\d{8})$/.test(date)||typeof ref!=='string'||!/^(?:|[A-Za-z0-9_-]{22})$/.test(ref))throw new Error('Invalid ticket parameters');
 let nonce=new Uint8Array(16);random.getRandomValues(nonce);let payload={v:1,kind,seed,date,ref,iat:now,exp:now+ttl,nonce:b64(nonce)},part=b64(enc.encode(JSON.stringify(payload)));let sig=await hmacSha256(key,enc.encode('cache-ticket-v1.'+part),subtle);return part+'.'+b64(sig);
}
async function verifyTicket({key,kind,token,now=Math.floor(Date.now()/1000),subtle=globalThis.crypto&&globalThis.crypto.subtle}){
 config(key,kind);if(!Number.isSafeInteger(now)||typeof token!=='string'||token.length>1024)return null;try{const parts=token.split('.');if(parts.length!==2)return null;const sig=unb64(parts[1]);if(sig.length!==32)return null;const expected=await hmacSha256(key,enc.encode('cache-ticket-v1.'+parts[0]),subtle);if(!equalBytes(sig,expected))return null;const payload=JSON.parse(dec.decode(unb64(parts[0])));return fields(payload,kind,now)?payload:null}catch(e){return null}
}
module.exports={issueTicket,verifyTicket};
