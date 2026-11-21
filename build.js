'use strict';
// Source template currently includes the V1 simulation; it is NOT yet shared with the worker.
// No build secrets are embedded. Private builds are not implemented and fail closed.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
const root=__dirname;
for(const key of ['WORKER_SECRET','S3_ENDPOINT','S3_REGION','S3_BUCKET','S3_ACCESS_KEY','S3_SECRET_KEY']) {
 if(process.env[key]) throw Error('Private configuration is not supported yet; refusing to build a misleading bundle');
}
const html=fs.readFileSync(path.join(root,'src/index.html'),'utf8');
const handler=fs.readFileSync(path.join(root,'worker/src/handler.js'),'utf8');
const og=fs.readFileSync(path.join(root,'assets/og_1200x630.png')).toString('base64');
const id=crypto.createHash('sha256').update(html).update(handler).update(og).digest('hex').slice(0,16);
const bundle="'use strict';\nconst BUILD_ID="+JSON.stringify(id)+";\nconst INDEX_HTML="+JSON.stringify(html)+";\nconst OG_BASE64="+JSON.stringify(og)+";\n"+handler+"\nif (typeof addEventListener === 'function') addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));\nif (typeof module !== 'undefined') module.exports = {handleRequest, dailyAt};\n";
for(const dir of ['dist','worker/dist','output'])fs.mkdirSync(path.join(root,dir),{recursive:true});
for(const file of ['index.html','dist/index.html','output/index.html'])fs.writeFileSync(path.join(root,file),html);
for(const file of ['dist/worker.js','worker/dist/worker.js','output/worker.js'])fs.writeFileSync(path.join(root,file),bundle);
console.log(`build ${id}: index ${Buffer.byteLength(html)} bytes; worker ${Buffer.byteLength(bundle)} bytes; validation NONE; store NONE`);
