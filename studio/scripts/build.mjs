import {cp,mkdir,rm,readFile,writeFile} from 'node:fs/promises';
const root=new URL('../',import.meta.url), dist=new URL('dist/',root);
await rm(dist,{recursive:true,force:true});await mkdir(dist,{recursive:true});
await cp(new URL('public/',root),dist,{recursive:true,filter:src=>!/(?:manage\.html|manage\.js|manage\.css)$/.test(src)});
const html=await readFile(new URL('public/index.html',root),'utf8');
const projects=JSON.parse(await readFile(new URL('public/data/collections.json',root),'utf8'));
for(const route of ['about','store',...projects.map(p=>'project/'+p.id)]){await mkdir(new URL(route+'/',dist),{recursive:true});await writeFile(new URL(route+'/index.html',dist),html);}
console.log('Built dist/: public website only. Photo manager and private originals excluded. Nothing deployed.');
// Preserve links shared from the former website.
for (const [file,target] of [['about.html','/about/'],['store.html','/store/']]) {
 await writeFile(new URL(file,dist),`<!doctype html><html lang="en"><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${target}"><title>Sam Benari</title><a href="${target}">Continue to Sam Benari</a></html>`);
}
const legacyFolders={"Through The Window":"through-the-window","CafeLife":"cafe-life","Soho":"soho","Rome":"rome","Other Work":"other-work"};
await writeFile(new URL('project.html',dist),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Sam Benari — Projects</title><script>const projects=${JSON.stringify(legacyFolders)};const id=projects[new URLSearchParams(location.search).get('p')];location.replace(id?'/project/'+id+'/':'/');</script><a href="/">Explore the projects</a></html>`);
