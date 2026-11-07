import assert from 'node:assert/strict';
import {readFile,writeFile,rm,access,readdir} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'), base='http://127.0.0.1:'+(process.env.PORT||4173);
const published=path.join(root,'public/data/collections.json'),draft=path.join(root,'data/draft.json');
const originalPublished=await readFile(published);let originalDraft;try{originalDraft=await readFile(draft);}catch{}
const headers={'Content-Type':'application/json','X-Photo-Manager':'local'};
const post=(route,value)=>fetch(base+'/api/'+route,{method:'POST',headers,body:JSON.stringify(value||{})});
let upload;
try{
 for(const route of ['/','/about','/store','/manage','/project/rome','/project/through-the-window'])assert.equal((await fetch(base+route)).status,200,route);
 const initial=JSON.parse(originalPublished);const photoCount=initial.reduce((n,p)=>n+p.photos.length,0),romeCount=initial.find(p=>p.id==='rome').photos.length;assert.ok(photoCount>0);
 for(const p of initial)for(const photo of p.photos){for(const key of ['src','thumb'])await access(path.join(root,'public',photo[key]));if(photo.source)assert.match(photo.source,/^https:\/\/sambenari.com\//);}
 console.log(`PASS: all routes and ${photoCount} photographs with thumbnails.`);
 assert.equal((await fetch(base+'/data/originals')).status,404);
 assert.equal((await fetch(base+'/api/apply',{method:'POST'})).status,403);
 assert.equal((await fetch(base+'/api/apply',{method:'POST',headers:{...headers,Origin:'https://example.com'}})).status,403);
 assert.equal((await fetch(base+'/api/upload?project=rome',{method:'POST',headers,body:'not an image'})).status,400);
 console.log('PASS: private paths, write protection and invalid image rejection.');
 await post('discard');
 const bytes=await readFile(path.join(root,'public/assets/through-the-window/001-thumb.jpg'));
 const response=await fetch(base+'/api/upload?project=rome',{method:'POST',headers:{'X-Photo-Manager':'local','X-File-Name':'verification.jpg'},body:bytes});
 assert.equal(response.status,201);upload=await response.json();
 let edited=await fetch(base+'/api/draft').then(r=>r.json());assert.equal(edited.find(p=>p.id==='rome').photos.length,romeCount+1);assert.equal((await fetch(base+'/data/collections.json').then(r=>r.json())).find(p=>p.id==='rome').photos.length,romeCount);
 await access(path.join(root,'public',upload.thumb));
 const p=edited[0];[p.photos[0],p.photos[1]]=[p.photos[1],p.photos[0]];p.photos[0].alt='Verification description';p.cover=p.photos[0].src;
 assert.equal((await post('draft',edited)).status,200);
 const persisted=await fetch(base+'/api/draft').then(r=>r.json());assert.equal(persisted[0].photos[0].id,p.photos[0].id);assert.equal(persisted[0].photos[0].alt,'Verification description');assert.equal(persisted[0].cover,p.cover);
 assert.equal((await post('apply')).status,200);assert.equal((await fetch(base+'/data/collections.json').then(r=>r.json())).find(p=>p.id==='rome').photos.length,romeCount+1);
 edited.find(p=>p.id==='rome').photos=edited.find(p=>p.id==='rome').photos.filter(p=>p.id!==upload.id);assert.equal((await post('draft',edited)).status,200);await access(path.join(root,'public',upload.src));
 console.log('PASS: real upload, generated thumbnail, draft isolation, reordering, alt text, cover, local apply and reversible collection removal.');
}finally{
 await writeFile(published,originalPublished);if(originalDraft)await writeFile(draft,originalDraft);else await rm(draft,{force:true});
 if(upload){await rm(path.join(root,'public',upload.src),{force:true});await rm(path.join(root,'public',upload.thumb),{force:true});for(const file of await readdir(path.join(root,'data/originals')))if(file.startsWith(upload.id))await rm(path.join(root,'data/originals',file));}
 console.log('Restored original collections and removed verification upload.');
}
