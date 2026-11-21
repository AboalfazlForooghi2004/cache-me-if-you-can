'use strict';
// Standalone, deliberately not enabled in production worker or builds.
const {signS3Request}=require('./sigv4');
function validKey(key){return typeof key==='string'&&key.length<=512&&/^[A-Za-z0-9_\-/]+$/.test(key)&&!key.startsWith('/')&&!key.endsWith('/')&&!key.includes('//')}
function createS3Store(config,fetcher=fetch){
 const {endpoint,bucket,region,accessKey,secretKey,subtle}=config;const base=new URL(endpoint);
 if(base.protocol!=='https:'||base.username||base.password||base.search||base.hash||base.pathname!=='/'||!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(bucket)||!region||!accessKey||!secretKey)throw new Error('Invalid S3 configuration');
 async function request(method,key,body='',headers={}){if(!validKey(key))throw new Error('Invalid key');const url=base.origin+'/'+bucket+'/'+key;const signed=await signS3Request({method,url,body,headers,region,accessKey,secretKey,subtle});const response=await fetcher(signed.url,{method,headers:signed.headers,...(method==='PUT'?{body:signed.body}:{}),redirect:'error'});return response}
 return {
  async get(key){const r=await request('GET',key);if(r.status===404)return null;if(!r.ok)throw new Error('Storage read failed');return new Uint8Array(await r.arrayBuffer())},
  async putIfAbsent(key,value){const r=await request('PUT',key,value,{'if-none-match':'*'});if(r.status===409||r.status===412)return false;if(!r.ok)throw new Error('Storage write failed');return true}
 };
}
function createMemoryStore(){const items=new Map();return {async get(key){if(!validKey(key))throw new Error('Invalid key');const v=items.get(key);return v?new Uint8Array(v):null},async putIfAbsent(key,value){if(!validKey(key))throw new Error('Invalid key');if(items.has(key))return false;items.set(key,new Uint8Array(typeof value==='string'?new TextEncoder().encode(value):value));return true}}}
module.exports={createS3Store,createMemoryStore};
