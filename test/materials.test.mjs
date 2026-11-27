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

test('问题与证据来源能按同一截止口径关联',async()=>{
 for(const file of ['session.json','alternative.json']){
  const j=JSON.parse(await readFile('fixtures/'+file,'utf8'));
  for(const m of j.entities.markets){
   assert.ok(m.question);assert.ok(m.questionId);
   const records=j.entities.evidenceRecords.filter(r=>m.evidenceSources.includes(r.source));
   assert.ok(records.length);
   for(const r of records){assert.equal(r.questionId,m.questionId);assert.equal(r.cutoff,m.cutoff);assert.ok(r.readings.length);}
  }
  for(const e of j.events.filter(e=>e.type==='report')) assert.ok(j.entities.evidenceRecords.some(r=>r.source===e.payload.evidence));
 }
});

test('在途成交与后到交付可通过真实成交身份关联',async()=>{
 for(const file of ['session.json','alternative.json']){
  const j=JSON.parse(await readFile('fixtures/'+file,'utf8'));
  const fills=j.events.filter(e=>e.type==='fill');
  for(const e of j.events.filter(e=>e.type==='trade_settlement')){
   const fill=fills.find(f=>f.payload.trade===e.payload.trade);
   assert.ok(fill);assert.equal(fill.payload.settled,false);
   assert.ok(BigInt(e.payload.units)<=BigInt(fill.payload.units));
   assert.ok(e.sequence>fill.sequence);
  }
 }
});
