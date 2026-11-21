'use strict';
// Public artifacts are always secret-free. Private artifacts go ONLY to ignored private_dist/.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname,secretKeys=['WORKER_SECRET','S3_ENDPOINT','S3_REGION','S3_BUCKET','S3_ACCESS_KEY','S3_SECRET_KEY','TRUSTED_CLIENT_IP_HEADER','TRUSTED_PROXY_CONFIRMED'];
const wantPrivate=process.env.PRIVATE_BUILD==='1';
if(!wantPrivate&&secretKeys.some(k=>process.env[k]))throw Error('Private configuration requires explicit PRIVATE_BUILD=1');
let privateConfig=null;
if(wantPrivate){
 if(secretKeys.some(k=>!process.env[k])||Buffer.byteLength(process.env.WORKER_SECRET||'')<32||process.env.TRUSTED_PROXY_CONFIRMED!=='I_UNDERSTAND')throw Error('Invalid private configuration');
 let endpoint;try{endpoint=new URL(process.env.S3_ENDPOINT)}catch(e){throw Error('Invalid private configuration')}if(endpoint.protocol!=='https:'||endpoint.username||endpoint.password||endpoint.search||endpoint.hash||endpoint.pathname!=='/')throw Error('Invalid private configuration');
 if(!/^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(process.env.S3_BUCKET)||!/^[A-Za-z0-9-]{1,64}$/.test(process.env.S3_REGION)||!/^[A-Za-z0-9_-]{1,128}$/.test(process.env.S3_ACCESS_KEY)||!/^[a-z0-9-]{1,64}$/.test(process.env.TRUSTED_CLIENT_IP_HEADER))throw Error('Invalid private configuration');
 privateConfig={secret:process.env.WORKER_SECRET,endpoint:process.env.S3_ENDPOINT,region:process.env.S3_REGION,bucket:process.env.S3_BUCKET,accessKey:process.env.S3_ACCESS_KEY,secretKey:process.env.S3_SECRET_KEY,identityHeader:process.env.TRUSTED_CLIENT_IP_HEADER};
}
const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8'),handler=fs.readFileSync(path.join(root,'worker/src/handler.js'),'utf8');
const og=fs.readFileSync(path.join(root,'assets/og_1200x630.png')).toString('base64');
const id=crypto.createHash('sha256').update(html).update(handler).update(og).digest('hex').slice(0,16);
const prelude=image=>"'use strict';\nconst BUILD_ID="+JSON.stringify(id)+";\nconst INDEX_HTML="+JSON.stringify(html)+";\nconst OG_BASE64="+JSON.stringify(image)+";\n"+handler+'\n';
const publicBundle=image=>prelude(image)+"if (typeof addEventListener === 'function') addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));\nif (typeof module !== 'undefined') module.exports = {handleRequest, dailyAt};\n";
for(const dir of ['dist','worker/dist','output'])fs.mkdirSync(path.join(root,dir),{recursive:true});
for(const file of ['index.html','dist/index.html','output/index.html'])fs.writeFileSync(path.join(root,file),html);
const bundle=publicBundle(og),lite=publicBundle('');
for(const file of ['dist/worker.js','worker/dist/worker.js','output/worker.js'])fs.writeFileSync(path.join(root,file),bundle);
for(const file of ['dist/worker.lite.js','worker/dist/worker.lite.js','output/worker.lite.js'])fs.writeFileSync(path.join(root,file),lite);
if(privateConfig){
 const modules=['crypto_utils','sigv4','store','tickets','nickname','lite_validation','online_service'];
 let factories='';for(const name of modules){let source=fs.readFileSync(path.join(root,'worker/src',name+'.js'),'utf8');factories+=JSON.stringify('./'+name)+':function(module,exports,require){\n'+source+'\n},\n'}
 const loader="const factories={\n"+factories+"};const cache={};function localRequire(id){if(!factories[id])throw Error('Unknown module');if(!cache[id]){const m={exports:{}};cache[id]=m;factories[id](m,m.exports,localRequire)}return cache[id].exports;}\n";
 const privateTail="const PRIVATE_CONFIG="+JSON.stringify(privateConfig)+";\n"+fs.readFileSync(path.join(root,'worker/src/private_entry.js'),'utf8');
 const makePrivate=image=>prelude(image)+loader+privateTail;
 fs.mkdirSync(path.join(root,'private_dist'),{recursive:true,mode:0o700});fs.chmodSync(path.join(root,'private_dist'),0o700);
 for(const [name,image] of [['worker.js',og],['worker.lite.js','']]){const file=path.join(root,'private_dist',name);fs.writeFileSync(file,makePrivate(image),{mode:0o600});fs.chmodSync(file,0o600)}
}
console.log(`build ${id}: index ${Buffer.byteLength(html)} bytes; public worker ${Buffer.byteLength(bundle)} bytes; public lite ${Buffer.byteLength(lite)} bytes; public validation NONE; store NONE`);
if(privateConfig)console.log('Private bundles written to ignored private_dist/; configuration is unverified on Arvan.');
