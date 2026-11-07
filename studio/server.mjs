import http from 'node:http';
import {readFile, writeFile, mkdir, rename, stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const exec=promisify(execFile), root=path.dirname(fileURLToPath(import.meta.url)), publicRoot=path.join(root,'public');
const published=path.join(publicRoot,'data/collections.json'), draft=path.join(root,'data/draft.json');
const port=Number(process.env.PORT||4173), host='127.0.0.1';
await mkdir(path.join(root,'data/originals'),{recursive:true});
async function collections(d=false){try{return JSON.parse(await readFile(d?draft:published,'utf8'));}catch(e){if(d&&e.code==='ENOENT')return collections();throw e;}}
async function atomic(file,data){const temp=file+'.tmp';await writeFile(temp,JSON.stringify(data,null,2));await rename(temp,file);}
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
async function body(req,limit=25*1024*1024){let size=0;const parts=[];for await(const part of req){size+=part.length;if(size>limit)throw Object.assign(Error('File exceeds 25 MB.'),{status:413});parts.push(part);}return Buffer.concat(parts);}
function validate(next,current){
 if(!Array.isArray(next)||next.length!==current.length)throw Error('Invalid collections.');
 return current.map(p=>{const n=next.find(q=>q.id===p.id);if(!n||!Array.isArray(n.photos))throw Error('Invalid collection.');const known=new Map(p.photos.map(x=>[x.id,x]));const seen=new Set();const photos=n.photos.map(x=>{const k=known.get(x.id);if(!k||seen.has(x.id))throw Error('Unknown or duplicate photograph.');seen.add(x.id);return {...k,alt:String(x.alt||'').slice(0,500)};});const covers=new Set([p.cover,...photos.map(x=>x.src)].filter(Boolean));if(n.cover&&!covers.has(n.cover))throw Error('Invalid cover.');return {...p,cover:n.cover||photos[0]?.src||null,photos};});
}
let mutating=false;
const server=http.createServer(async(req,res)=>{
 const send=(code,data)=>{res.writeHead(code,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
 try{
  if(!['127.0.0.1:'+port,'localhost:'+port].includes(req.headers.host))return send(403,{error:'Local access only.'});
  const url=new URL(req.url,'http://'+req.headers.host);
  if(url.pathname.startsWith('/api/')){
   if(req.headers.origin && !['http://127.0.0.1:'+port,'http://localhost:'+port].includes(req.headers.origin))return send(403,{error:'Local origin required.'});
   if(req.method==='GET'&&url.pathname==='/api/draft')return send(200,await collections(true));
   if(req.method!=='POST')return send(405,{error:'Method not allowed.'});
   if(req.headers['x-photo-manager']!=='local')return send(403,{error:'Open the local photo manager.'});
   if(mutating)return send(409,{error:'Another change is saving. Please try again.'});
   mutating=true;
   try{
    if(url.pathname==='/api/upload'){
     const list=await collections(true), project=list.find(p=>p.id===url.searchParams.get('project'));if(!project)throw Error('Unknown project.');
     const bytes=await body(req);const jpeg=bytes[0]===255&&bytes[1]===216;const png=bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]));const webp=bytes.toString('ascii',0,4)==='RIFF'&&bytes.toString('ascii',8,12)==='WEBP';
     if(!jpeg&&!png&&!webp)throw Error('Please use a JPEG, PNG or WebP photograph.');
     const id=randomUUID(), original=path.join(root,'data/originals',id+(jpeg?'.jpg':png?'.png':'.webp')), rel='/assets/uploads/'+id+'.jpg', output=path.join(publicRoot,rel), thumb=output.replace('.jpg','-thumb.jpg');
     await mkdir(path.dirname(output),{recursive:true});await writeFile(original,bytes);
     await exec('sips',['-s','format','jpeg','-s','formatOptions','85','-Z','2200',original,'--out',output]);
     await exec('sips',['-Z','440',output,'--out',thumb]);
     const photo={id,src:rel,thumb:rel.replace('.jpg','-thumb.jpg'),alt:project.title+' — '+decodeURIComponent(req.headers['x-file-name']||'new photograph')};
     project.photos.push(photo);project.cover ||= rel;await atomic(draft,list);return send(201,photo);
    }
    if(url.pathname==='/api/draft'){const next=validate(JSON.parse((await body(req,1024*1024)).toString()),await collections(true));await atomic(draft,next);return send(200,{ok:true});}
    if(url.pathname==='/api/apply'){const current=await collections(true);await atomic(published,current);return send(200,{ok:true});}
    if(url.pathname==='/api/discard'){await atomic(draft,await collections());return send(200,{ok:true});}
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
server.listen(port,host,()=>console.log(`Sam Benari preview: http://${host}:${port}\nPhoto manager: http://${host}:${port}/manage`));
server.on('error',error=>{console.error('Unable to start local preview:',error.message);process.exitCode=1;});
