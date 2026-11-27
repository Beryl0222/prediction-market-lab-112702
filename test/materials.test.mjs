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
test('演练签名编码可读取',async()=>{
 const s=JSON.parse(await readFile('fixtures/signatures.json','utf8'));
 const pub=createPublicKey({key:Buffer.from(s.publicKeyDer,'hex'),format:'der',type:'spki'});
 assert.equal(verify(null,Buffer.from(s.message),pub,Buffer.from(s.signature,'hex')),true);
 assert.equal(verify(null,Buffer.from(s.message+'!'),pub,Buffer.from(s.signature,'hex')),false);
});
