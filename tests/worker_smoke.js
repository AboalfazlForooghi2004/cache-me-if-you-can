'use strict';
const assert=require('assert');
const fs=require('fs');
const {handleRequest}=require('../worker/dist/worker.js');
(async()=>{
 const page=await handleRequest(new Request('http://localhost/'));
 assert.equal(page.status,200);assert.equal(await page.text(),fs.readFileSync('index.html','utf8'));
 const ping=await handleRequest(new Request('http://localhost/api/ping'));
 const p=await ping.json();assert.equal(p.ok,true);assert(Number.isFinite(p.t));
 const unavailable=await handleRequest(new Request('http://localhost/api/score'));
 assert.equal(unavailable.status,503);
 const post=await handleRequest(new Request('http://localhost/api/score',{method:'POST'}));assert.equal(post.status,405);
 console.log('PASS worker GET /, GET /api/ping, fail-closed API, method rejection');
})().catch(e=>{console.error(e);process.exitCode=1});
