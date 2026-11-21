'use strict';
// Validation primitive for a FUTURE server endpoint; not enabled in public worker.
function normalizeNickname(value){
 if(typeof value!=='string')return null;
 var n=value.normalize('NFKC').replace(/ك/g,'ک').replace(/ي/g,'ی').trim();
 if(!/^[A-Za-z\u0621-\u063A\u0641-\u064A\u0671-\u06D3]{3,16}$/.test(n))return null;
 var blocked=['admin','administrator','moderator','support','http','www','com','fuck','shit','nazi','کس','کیر','کون','جنده'];
 var folded=n.toLowerCase();if(blocked.some(function(x){return folded.indexOf(x)!==-1}))return null;
 return n;
}
if(typeof module!=='undefined')module.exports={normalizeNickname};
