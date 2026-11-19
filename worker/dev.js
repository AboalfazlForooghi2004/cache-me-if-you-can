'use strict';
// Local development adapter; this is not an Arvan runtime emulator.
const http=require('http');
const {handleRequest}=require('./dist/worker.js');
const port=Number(process.env.PORT)||8787;
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost:'+port);
  const init={method:req.method,headers:req.headers};
  if(!['GET','HEAD'].includes(req.method)){init.body=req;init.duplex='half'}
  const response=await handleRequest(new Request(url,init));
  res.writeHead(response.status,Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
 }catch(e){res.writeHead(500);res.end('Internal error')}
}).listen(port,'0.0.0.0',()=>console.log('Local worker at http://localhost:'+port));
