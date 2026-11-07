import http from 'node:http';
import {readFile,writeFile,mkdir,rename,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStudio} from './lib/studio.mjs';
const root=process.env.STUDIO_WORKSPACE||path.dirname(fileURLToPath(import.meta.url)),publicRoot=path.join(root,'public');
const port=Number(process.env.PORT||4173),host='127.0.0.1',studio=createStudio(root);
await mkdir(path.join(root,'data'),{recursive:true});
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
async function body(req,limit=50*1024*1024){let size=0;const parts=[];for await(const part of req){size+=part.length;if(size>limit)throw Object.assign(Error('File exceeds 50 MB.'),{status:413});parts.push(part);}return Buffer.concat(parts);}
let mutating=false;
const server=http.createServer(async(req,res)=>{
 const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
 try{
  if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return send(403,{error:'Local access only.'});
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname.startsWith('/api/')){
   if(req.headers.origin&&!['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin))return send(403,{error:'Local origin required.'});
   if(req.method==='GET'){if(await studio.handle({url,req,res,send,body}))return;return send(404,{error:'Unknown action.'});}
   if(req.method!=='POST')return send(405,{error:'Method not allowed.'});
   if(req.headers['x-photo-manager']!=='local')return send(403,{error:'Open Sam Benari Studio.'});
   if(mutating)return send(409,{error:'Another change is saving. Please try again.'});mutating=true;
   try{
    if(await studio.handle({url,req,res,send,body}))return;
    if(url.pathname==='/api/apply'){const next=await studio.draft();const file=path.join(publicRoot,'data/collections.json');await writeFile(file+'.tmp',JSON.stringify(next,null,2));await rename(file+'.tmp',file);return send(200,{ok:true});}
    if(url.pathname==='/api/discard'){await studio.saveDraft(await studio.preview());return send(200,{ok:true});}
    return send(404,{error:'Unknown action.'});
   }finally{mutating=false;}
  }
  if(!['GET','HEAD'].includes(req.method))return send(405,{error:'Method not allowed.'});
  const decoded=decodeURIComponent(url.pathname);let file=path.resolve(publicRoot,'.'+decoded);if(!file.startsWith(publicRoot+path.sep))file=path.join(publicRoot,'index.html');
  if(decoded==='/'||/^\/(project\/[^/]+|about|store)\/?$/.test(decoded))file=path.join(publicRoot,'index.html');
  if(decoded==='/manage'||decoded==='/manage/')file=path.join(publicRoot,'manage.html');
  const info=await stat(file);if(!info.isFile())return send(404,{error:'Not found.'});
  res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':/\.(jpg|png|webp)$/.test(file)?'public, max-age=86400':'no-store','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:await readFile(file));
 }catch(e){if(!res.headersSent)send(e.code==='ENOENT'?404:e.status||400,{error:e.code==='ENOENT'?'Not found.':e.message});else res.end();}
});
server.listen(port,host,()=>console.log(`Sam Benari Studio: http://${host}:${port}/manage`));
server.on('error',e=>{console.error(e.message);process.exitCode=1;});
