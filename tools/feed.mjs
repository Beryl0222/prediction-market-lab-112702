import http from 'node:http';
import {readFile,readdir} from 'node:fs/promises';
const files=(await readdir('fixtures')).filter(n=>n.endsWith('.json'));
const server=http.createServer(async(req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname.slice(1));
 if(req.method!=='GET'||!files.includes(name)){res.writeHead(404);res.end('资料不存在');return;}
 res.setHeader('Content-Type','application/json; charset=utf-8');res.end(await readFile('fixtures/'+name));
});
server.listen(Number(process.env.PORT||0),'127.0.0.1',()=>console.log(JSON.stringify({address:server.address()})));
