'use strict';
// P0-only bootstrap: embed the unchanged offline game into a Workers-style bundle.
// This does NOT extract or validate the simulation; P1 is deliberately not enabled.
const fs=require('fs'),path=require('path');
const root=__dirname;
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const handler=fs.readFileSync(path.join(root,'worker/src/handler.js'),'utf8');
const bundle="'use strict';\nconst INDEX_HTML="+JSON.stringify(html)+";\n"+handler+"\nif (typeof addEventListener === 'function') addEventListener('fetch', e => e.respondWith(handleRequest(e.request)));\nif (typeof module !== 'undefined') module.exports = {handleRequest};\n";
fs.mkdirSync(path.join(root,'worker/dist'),{recursive:true});
fs.writeFileSync(path.join(root,'worker/dist/worker.js'),bundle);
console.log('worker bundle:',Buffer.byteLength(bundle),'bytes');
