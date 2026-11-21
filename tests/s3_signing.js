'use strict';
const assert=require('assert'),{webcrypto}=require('crypto');const {signS3Request,canonicalPath,canonicalQuery}=require('../worker/src/sigv4'),{createS3Store,createMemoryStore}=require('../worker/src/store');
(async()=>{
 const signed=await signS3Request({method:'GET',url:'https://examplebucket.s3.amazonaws.com/test.txt',headers:{Range:'bytes=0-9'},accessKey:'AKIAIOSFODNN7EXAMPLE',secretKey:'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',region:'us-east-1',now:new Date('2013-05-24T00:00:00Z'),subtle:webcrypto.subtle});
 assert.equal(signed.headers.authorization,'AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41');
 assert.equal(canonicalPath('/a%20b/%24.txt'),'/a%20b/%24.txt');assert.equal(canonicalQuery(new URLSearchParams('z=2&a=%2F&a=1&empty=')),'a=%2F&a=1&empty=&z=2');
 const memory=createMemoryStore();assert.equal(await memory.get('a/b'),null);assert(await memory.putIfAbsent('a/b','hello'));assert(!await memory.putIfAbsent('a/b','again'));assert.equal(new TextDecoder().decode(await memory.get('a/b')),'hello');await assert.rejects(memory.get('../bad'));
 const calls=[];const mock=async (url,opts)=>{calls.push([url,opts]);if(opts.method==='GET')return new Response('hello');return new Response('',{status:calls.length===2?200:412})};
 const store=createS3Store({endpoint:'https://storage.example.test',bucket:'test-bucket',region:'test-region',accessKey:'test-key',secretKey:'test-secret',subtle:webcrypto.subtle},mock);
 assert.equal(new TextDecoder().decode(await store.get('scores/day/one')),'hello');assert(await store.putIfAbsent('scores/day/one','hello'));assert(!(await store.putIfAbsent('scores/day/one','again')));assert.equal(calls[0][0],'https://storage.example.test/test-bucket/scores/day/one');assert.equal(calls[1][1].headers['if-none-match'],'*');assert(calls[1][1].headers.authorization.includes('if-none-match'));await assert.rejects(store.get('bad/../key'));assert.throws(()=>createS3Store({endpoint:'http://example.test',bucket:'valid-bucket',region:'r',accessKey:'a',secretKey:'b'}));
 console.log('PASS AWS SigV4 published GET vector, canonical encoding and isolated S3/memory mock stores');
})().catch(e=>{console.error(e);process.exitCode=1});
