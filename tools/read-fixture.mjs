import {readFile,readdir} from 'node:fs/promises';
const names=(await readdir('fixtures')).filter(n=>n.endsWith('.json')).sort();
const requested=process.argv[2];
if(requested&&!names.includes(requested)){throw new Error('资料文件不存在');}
for(const name of requested?[requested]:names){
 const value=JSON.parse(await readFile('fixtures/'+name,'utf8'));
 console.log(JSON.stringify({file:name,data:value},null,2));
}
