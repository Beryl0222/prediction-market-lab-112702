import {spawnSync} from 'node:child_process';
for(const file of ['tools/read-fixture.mjs','tools/feed.mjs','test/materials.test.mjs']){
 const r=spawnSync(process.execPath,['--check',file],{stdio:'inherit'});
 if(r.status!==0) process.exit(r.status||1);
}
console.log('资料工具语法检查通过');
