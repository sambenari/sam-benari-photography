import {cp,mkdir,rm,readFile,writeFile,stat} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..'),publicRoot=path.join(root,'public');
const dist=process.env.STUDIO_OUTPUT?path.resolve(process.env.STUDIO_OUTPUT):path.join(root,'dist');
if(dist===root||dist===publicRoot||!dist.startsWith(root+path.sep))throw Error('Invalid export directory.');
const projects=JSON.parse(await readFile(process.env.STUDIO_MANIFEST||path.join(publicRoot,'data/collections.json'),'utf8'));
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
const fixed=['index.html','app.js','style.css','favicon.svg','data/bio.json','CNAME','.nojekyll'];
const assets=new Set(['/assets/through-the-window/018.jpg','/assets/portrait.jpg']);
for(const p of projects){if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id))throw Error('Invalid project slug.');if(p.cover){assets.add(p.cover);if(p.cover.endsWith('.jpg'))assets.add(p.cover.replace('.jpg','-thumb.jpg'));}for(const photo of p.photos){assets.add(photo.src);assets.add(photo.thumb);}}
for(const source of assets){if(!source.startsWith('/assets/')||source.includes('..'))throw Error('Invalid image path.');const relative=source.slice(1);await mkdir(path.dirname(path.join(dist,relative)),{recursive:true});await cp(path.join(publicRoot,relative),path.join(dist,relative));}
for(const file of fixed){await mkdir(path.dirname(path.join(dist,file)),{recursive:true});await cp(path.join(publicRoot,file),path.join(dist,file));}
await mkdir(path.join(dist,'data'),{recursive:true});await writeFile(path.join(dist,'data/collections.json'),JSON.stringify(projects,null,2)+'\n');
const html=await readFile(path.join(publicRoot,'index.html'),'utf8');
for(const route of ['about','store',...projects.map(p=>'project/'+p.id)]){await mkdir(path.join(dist,route),{recursive:true});await writeFile(path.join(dist,route,'index.html'),html);}
for(const [file,target] of [['about.html','/about/'],['store.html','/store/']])await writeFile(path.join(dist,file),`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Sam Benari</title><a href="${target}">Continue to Sam Benari</a></html>`);
const legacyFolders={"Through The Window":"through-the-window","CafeLife":"cafe-life","Soho":"soho","Rome":"rome","Other Work":"other-work"};
await writeFile(path.join(dist,'project.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Sam Benari — Projects</title><script>const projects=${JSON.stringify(legacyFolders)};const id=projects[new URLSearchParams(location.search).get('p')];location.replace(id?'/project/'+id+'/':'/');</script><a href="/">Explore the projects</a></html>`);
console.log('Built public website with '+projects.length+' projects. Local editor, photo pool and unused photographs excluded. Nothing deployed.');
