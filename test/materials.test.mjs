import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';
test('事件资料身份、顺序与载荷完整',async()=>{
 const data=JSON.parse(await readFile('fixtures/session.json','utf8'));
 assert.equal(data.synthetic,true);
 assert.ok(Object.keys(data.entities).length);
 const ids=new Set();
 for(const [i,event] of data.events.entries()){
  assert.equal(event.sequence,i+1); assert.equal(typeof event.type,'string');
  assert.ok(event.payload&&typeof event.payload==='object');
  assert.ok(!ids.has(event.id));ids.add(event.id);
  assert.ok(Number.isFinite(Date.parse(event.observedAt)));
 }
 assert.ok(ids.size>=8);
});
test('所有JSON资料均可读取',async()=>{
 for(const name of await readdir('fixtures')){
  if(name.endsWith('.json'))assert.ok(JSON.parse(await readFile('fixtures/'+name,'utf8')));
 }
});

import {createPublicKey,verify} from 'node:crypto';
const canonical=x=>x===null||typeof x!=='object'?JSON.stringify(x):Array.isArray(x)?'['+x.map(canonical).join(',')+']':'{'+Object.keys(x).sort().map(k=>JSON.stringify(k)+':'+canonical(x[k])).join(',')+'}';
test('来源事件签名的字节完整性',async()=>{
 const keys=JSON.parse(await readFile('fixtures/actors.json','utf8')).actors;
 let checked=0;
 for(const file of ['session.json','alternative.json']){
  const j=JSON.parse(await readFile('fixtures/'+file,'utf8'));
  for(const e of j.events)for(const a of [e.payload.authorization,e.payload.sponsorship]){
   if(!a)continue;
   const pub=createPublicKey({key:Buffer.from(keys[a.envelope.domain.actor].publicKeyDer,'hex'),format:'der',type:'spki'});
   const bytes=Buffer.from(canonical(a.envelope));
   assert.equal(verify(null,bytes,pub,Buffer.from(a.signature,'hex')),true);
   assert.equal(verify(null,Buffer.concat([bytes,Buffer.from('!')]),pub,Buffer.from(a.signature,'hex')),false);
   checked++;
  }
 }
 assert.ok(checked>0);
});
