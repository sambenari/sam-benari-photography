import {readFile,writeFile,mkdir,rename,stat,copyFile,readdir,rm,access} from 'node:fs/promises';
import {createReadStream,realpathSync} from 'node:fs';
import path from 'node:path';
import {randomUUID,createHash} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
const run=promisify(execFile);
const nibble=[0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];
const distance=(a,b,limit)=>{if(!a||!b||a.length!==b.length)return 999;let n=0;for(let i=0;i<a.length;i++){n+=nibble[parseInt(a[i],16)^parseInt(b[i],16)];if(n>limit)return n;}return n;};
const normalize=s=>String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
const suggested=words=>{const tags=new Set(words.map(normalize)),p=[];if(tags.has('throughthewindow'))p.push('through-the-window');if(tags.has('cafelife'))p.push('cafe-life');return p.length?p:['other-work'];};
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
const pause=ms=>new Promise(resolve=>setTimeout(resolve,ms));
export function createStudio(root){
 root=realpathSync(root);
 const pub=path.join(root,'public'),data=path.join(root,'data'),indexFile=path.join(data,'pool/index.json'),tools=process.env.STUDIO_TOOLS||path.join(data,'photo-tools'),repo=process.env.STUDIO_REPOSITORY||path.join(root,'publishing');
 let poolCache=null,liveCache=null,job=null,plans=new Map(),syncJob=null,activeRepo=repo;
 const read=async(file,fallback)=>{try{return JSON.parse(await readFile(file,'utf8'));}catch(e){if(e.code==='ENOENT'&&fallback!==undefined)return structuredClone(fallback);throw e;}};
 const atomic=async(file,value)=>{await mkdir(path.dirname(file),{recursive:true});const temp=file+'.'+randomUUID()+'.tmp';await writeFile(temp,JSON.stringify(value,null,2)+'\n');await rename(temp,file);};
 const preview=()=>read(path.join(pub,'data/collections.json'));
 const draft=async()=>read(path.join(data,'draft.json'),await preview());
 const saveDraft=items=>atomic(path.join(data,'draft.json'),items);
 const pool=async()=>{if(!poolCache){poolCache=await read(indexFile,{version:1,items:[]});for(const item of poolCache.items)item.suggestedProjects=suggested(item.keywords||[]);if(!poolCache.items.length){const list=await preview();for(const p of list)for(const photo of p.photos)if(!poolCache.items.some(x=>x.id===photo.id))poolCache.items.push({id:photo.id,aliases:[photo.id],filename:path.basename(photo.src),title:photo.alt,keywords:[],suggestedProjects:[p.id],source:'website',originalPath:path.relative(root,path.join(pub,photo.src)),photo});await savePool();}}return poolCache;};
 const savePool=()=>atomic(indexFile,poolCache);
 const localPath=relative=>{const resolved=path.resolve(root,relative);if(!resolved.startsWith(root+path.sep))throw Error('Invalid photo path.');return resolved;};
 const getItem=async id=>{const item=(await pool()).items.find(p=>p.id===id);if(!item)throw Error('Photograph not found.');return item;};
 const same=(a,b)=>{if(!a||!b||!b.height||Math.abs((a.width/a.height)/(b.width/b.height)-1)>.025)return false;if(distance(a.dhash,b.dhash,14)>14||distance(a.ahash,b.ahash,12)>12)return false;if(!a.pixels||!b.pixels)return true;const x=Buffer.from(a.pixels,'base64'),y=Buffer.from(b.pixels,'base64');let xm=0,ym=0;for(let i=0;i<256;i++){xm+=x[i];ym+=y[i];}xm/=256;ym/=256;let sum=0;for(let i=0;i<256;i++)sum+=((x[i]-xm)-(y[i]-ym))**2;return sum/256<=64;};
 const metadata=async file=>JSON.parse((await run(tools,['inspect',file],{maxBuffer:1024*1024})).stdout);
 async function render(source,target,max){await mkdir(path.dirname(target),{recursive:true});await run(tools,['render',source,target,String(max)],{timeout:120000});}
 async function materialize(item){
  if(item.photo)return item.photo;
  const src='/assets/pool/'+item.id+'.jpg',thumb=src.replace('.jpg','-thumb.jpg');
  await render(localPath(item.originalPath),path.join(pub,src),2200);await render(localPath(item.originalPath),path.join(pub,thumb),440);
  item.photo={id:item.id,src,thumb,alt:item.title||item.filename,sourceFilename:item.filename};await savePool();return item.photo;
 }
 function inProject(item,p){return p.photos.some(photo=>item.aliases.includes(photo.id)||photo.src===item.photo?.src);}
 function membership(item,list){return list.flatMap(p=>{const photo=inProject(item,p),cover=!!p.cover&&[...(item.assetSources||[]),item.photo?.src].includes(p.cover);return photo||cover?[{id:p.id,title:p.title,cover:cover&&!photo}]:[];});}
 async function live(force=false){
  if(!force&&liveCache&&Date.now()-liveCache.checked<60000)return liveCache;
  if(process.env.STUDIO_TEST_MODE==='1'){liveCache={collections:await read(path.join(data,'test-live.json'),await preview()),checked:Date.now(),ok:true};return liveCache;}
  try{const r=await fetch('https://sambenari.com/data/collections.json?studio='+Date.now(),{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Website returned '+r.status);const list=await r.json();if(!Array.isArray(list))throw Error('Invalid website response');liveCache={collections:list,checked:Date.now(),ok:true};await atomic(path.join(data,'last-live.json'),list);}
  catch(e){liveCache={collections:await read(path.join(data,'last-live.json'),await preview()),checked:Date.now(),ok:false,error:'Could not reach the live site. Showing the last known website.'};}return liveCache;
 }
 function diff(before,after){const result=[];for(const p of after){const old=before.find(x=>x.id===p.id),ids=new Set(old?.photos.map(x=>x.id)||[]),next=new Set(p.photos.map(x=>x.id));const added=p.photos.filter(x=>!ids.has(x.id)).length,removed=(old?.photos||[]).filter(x=>!next.has(x.id)).length;const order=!!old&&digest(old.photos.map(x=>x.id))!==digest(p.photos.map(x=>x.id));const details=!!old&&digest(old.photos)!==digest(p.photos);if(!old||added||removed||order||details||p.title!==old.title||p.cover!==old.cover)result.push({id:p.id,title:p.title,created:!old,added,removed,reordered:order&&!added&&!removed,detailsChanged:details&&!added&&!removed,coverChanged:old?.cover!==p.cover});}for(const p of before)if(!after.some(x=>x.id===p.id))result.push({id:p.id,title:p.title,deleted:true,removed:p.photos.length,added:0});return result;}
 async function state(force=false){const [d,p,l,library]=await Promise.all([draft(),preview(),live(force),pool()]);const privateFields=new Set(['originalPath','thumbPath','fingerprint','photo']);return {selectionRecovery:await read(path.join(data,'ui-selection-recovery.json'),null),draft:d,draftRevision:digest(d),preview:p,live:l.collections,liveConnected:l.ok,liveMessage:l.error||null,liveChecked:l.checked,pool:library.items.map(item=>({...Object.fromEntries(Object.entries(item).filter(([k])=>!privateFields.has(k))),thumb:'/api/pool/image/'+encodeURIComponent(item.id)+'?thumb=1',image:'/api/pool/image/'+encodeURIComponent(item.id),liveIn:membership(item,l.collections),draftIn:membership(item,d)})),changes:diff(l.collections,d),publish:job,sync:syncJob};}
 async function validate(next){const current=await draft();if(!Array.isArray(next)||next.length>200)throw Error('Invalid projects.');const library=(await pool()).items;const known=new Map();for(const p of [...await preview(),...current])for(const photo of p.photos)known.set(photo.id,photo);for(const item of library)if(item.photo)known.set(item.photo.id,item.photo);const ids=new Set();return next.map(p=>{if(!/^[a-z0-9][a-z0-9-]{0,79}$/.test(p.id)||ids.has(p.id)||!current.some(x=>x.id===p.id))throw Error('Unknown or duplicate project.');ids.add(p.id);if(!Array.isArray(p.photos))throw Error('Invalid photographs.');const seen=new Set();const photos=p.photos.map(photo=>{const k=known.get(photo.id);if(!k||seen.has(photo.id))throw Error('Unknown or duplicate photograph.');seen.add(photo.id);return {...k,alt:String(photo.alt||'').slice(0,500)};});const previous=current.find(x=>x.id===p.id),covers=new Set([previous.cover,...photos.map(x=>x.src)].filter(Boolean));if(p.cover&&!covers.has(p.cover))throw Error('Unknown cover photograph.');return {...previous,title:String(p.title||'Untitled project').trim().slice(0,100),description:String(p.description||'').slice(0,2000),photos,cover:p.cover||photos[0]?.src||null};});}
 async function ingest(file,filename,source='upload',photosId=null){
  const info=await metadata(file),library=await pool();let item=library.items.find(p=>same(info,p.fingerprint));
  if(item){item.keywords=[...new Set([...(item.keywords||[]),...info.keywords])];item.suggestedProjects=suggested(item.keywords);if(photosId)item.photosId=photosId;await savePool();return {item,duplicate:true};}
  const id='pool-'+randomUUID(),ext=path.extname(filename).toLowerCase()||'.jpg',original=path.join(data,'pool/originals',id+ext),thumb=path.join(data,'pool/thumbs',id+'.jpg');await mkdir(path.dirname(original),{recursive:true});await copyFile(file,original);await render(original,thumb,440);
  item={id,aliases:[id],filename:path.basename(filename),title:info.title||'',date:info.date||'',keywords:info.keywords,suggestedProjects:suggested(info.keywords),source,originalPath:path.relative(root,original),thumbPath:path.relative(root,thumb),fingerprint:info,...(photosId?{photosId}:{})};library.items.unshift(item);await savePool();return {item,duplicate:false};
 }
 const git=async args=>(await run('git',['-C',activeRepo,...args],{timeout:120000,maxBuffer:4*1024*1024,env:{...process.env,GIT_TERMINAL_PROMPT:'0',GIT_SSH_COMMAND:'ssh -o BatchMode=yes'}})).stdout.trim();
 async function persistJob(){await atomic(path.join(data,'publish-job.json'),job);const history=path.join(data,'publish-history',job.id+'.json'),saved=await read(history,{});await atomic(history,{...saved,...job});}
 async function updateJob(status,message,extra={}){job={...job,status,message,...extra,updatedAt:new Date().toISOString()};await persistJob();}
 async function verifyDeployment(){const active=job;if(!active||active.status!=='deploying')return;for(let i=0;i<100;i++){if(job!==active&&job?.id!==active.id)return;try{const r=await fetch('https://sambenari.com/release.json?studio='+Date.now(),{signal:AbortSignal.timeout(12000)});if(r.ok&&(await r.json()).releaseId===active.releaseId){liveCache=null;const published=await live(true);if(!published.ok||(active.manifestHash&&digest(published.collections)!==active.manifestHash)){await updateJob('verification-pending','The release is online, but its project photographs have not matched the reviewed update yet. Check the live update again.');return;}await updateJob('success','Your website is updated. All changes are live.',{finishedAt:new Date().toISOString()});return;}}catch{}await pause(6000);}await updateJob('verification-pending','Pushed to GitHub. The live site has not confirmed the update yet. Use Check live update to verify again.');}
 async function publish(snapshot){
  try{
   await updateJob('preparing','Checking the publishing repository…');
   const remote=await git(['remote','get-url','origin']);if(process.env.STUDIO_TEST_MODE!=='1'&&!['git@github.com:sambenari/sam-benari-photography.git','https://github.com/sambenari/sam-benari-photography.git'].includes(remote))throw Error('This is not the configured photography repository.');
   if(await git(['status','--porcelain','--untracked-files=no']))throw Error('The publishing checkout has unsaved file changes. Save or review them before publishing.');
   await git(['fetch','origin','main']);const head=await git(['rev-parse','refs/remotes/origin/main']);const author=await git(['log','-1','--format=%an']),email=await git(['log','-1','--format=%ae']);const checkout=path.join(data,'publishing',job.id);await mkdir(path.dirname(checkout),{recursive:true});await run('git',['clone','--local',repo,checkout],{timeout:120000,maxBuffer:1024*1024});activeRepo=checkout;await git(['checkout','-B','main',head]);await git(['remote','set-url','origin',remote]);await git(['config','user.name',author]);await git(['config','user.email',email]);
   const releaseId=randomUUID(),releaseDir=path.join(data,'releases',releaseId),manifest=path.join(data,'release-manifest.json');await atomic(manifest,snapshot);
   await updateJob('building','Preparing your photographs and project pages…',{releaseId,manifestHash:digest(snapshot)});
   await run(process.execPath,[path.join(root,'scripts/build.mjs')],{cwd:root,env:{...process.env,STUDIO_MANIFEST:manifest,STUDIO_OUTPUT:releaseDir},timeout:300000,maxBuffer:1024*1024});
   await atomic(path.join(releaseDir,'release.json'),{releaseId,publishedAt:new Date().toISOString()});
   const staged=[];
   async function copyTree(from,to,relative=''){for(const entry of await readdir(from,{withFileTypes:true})){const rel=path.posix.join(relative,entry.name),src=path.join(from,entry.name),dest=path.join(to,entry.name);if(entry.isDirectory()){await mkdir(dest,{recursive:true});await copyTree(src,dest,rel);}else if(entry.isFile()){await mkdir(path.dirname(dest),{recursive:true});await copyFile(src,dest);staged.push(rel);}}}
   await copyTree(releaseDir,activeRepo);
   // Keep the runnable source's gallery data and assets in step with the public export.
   for(const rel of staged.filter(p=>p.startsWith('assets/')||['data/collections.json','data/bio.json','app.js','style.css','index.html','favicon.svg'].includes(p))){const dest=path.join(activeRepo,'studio/public',rel);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(releaseDir,rel),dest);}
   const sourcePaths=[];
   for(const file of ['.gitignore','README.md','STUDIO_GUIDE.md','scripts/test-studio.mjs','server.mjs','package.json','scripts/build.mjs','public/manage.html','public/manage.js','public/manage.css','lib/studio.mjs','macos/PhotoTools.m','macos/MakeIcon.m','macos/StudioApp.m','scripts/build-mac-app.mjs']){try{await access(path.join(root,file));const dest=path.join(activeRepo,'studio',file);await mkdir(path.dirname(dest),{recursive:true});await copyFile(path.join(root,file),dest);sourcePaths.push('studio/'+file);}catch(e){if(e.code!=='ENOENT')throw e;}}
   const files=[...staged,...staged.filter(p=>p.startsWith('assets/')||['data/collections.json','data/bio.json','app.js','style.css','index.html','favicon.svg'].includes(p)).map(p=>'studio/public/'+p),...sourcePaths];
   for(let i=0;i<files.length;i+=100)await git(['add','--',...files.slice(i,i+100)]);
   await git(['diff','--cached','--check']);await git(['commit','-m','Update photography projects from Sam Benari Studio']);const commit=await git(['rev-parse','HEAD']);
   await updateJob('pushing','Uploading your changes to GitHub…',{commit,commitUrl:'https://github.com/sambenari/sam-benari-photography/commit/'+commit});await git(['push','origin','main']);activeRepo=repo;await rm(checkout,{recursive:true,force:true}).catch(()=>{});await rm(releaseDir,{recursive:true,force:true}).catch(()=>{});
   await atomic(path.join(pub,'data/collections.json'),snapshot);
   if(process.env.STUDIO_TEST_MODE==='1'){await updateJob('success','Test publishing completed.');return;}
   await updateJob('deploying','GitHub Pages is publishing your website. This can take a few minutes.');await verifyDeployment();
  }catch(e){await updateJob('error','The update could not finish: '+(e.stderr||e.message).slice(0,1500));}finally{activeRepo=repo;}
 }
 async function recover(){job=await read(path.join(data,'publish-job.json'),null);if(job?.status==='deploying')void verifyDeployment();else if(job&&!['success','error','verification-pending'].includes(job.status)){job.status='error';job.message='The app closed before publishing finished. Your draft is saved. Review and try the update again.';await persistJob();}}
 void recover();
 const publishing=()=>job&&['preparing','building','pushing','deploying'].includes(job.status);
 async function handle({url,req,res,send,body}){
  const route=url.pathname;
  if(req.method==='GET'){
   if(route==='/api/health'){send(200,{app:'sam-benari-studio',version:3,appVersion:'1.2.1'});return true;}
   if(route==='/api/studio'){send(200,await state(url.searchParams.get('refresh')==='1'));return true;}
   if(route==='/api/publish/status'){send(200,job);return true;}
   if(route==='/api/pool/sync-status'){send(200,syncJob);return true;}
   if(route.startsWith('/api/pool/image/')){const item=await getItem(decodeURIComponent(route.slice('/api/pool/image/'.length)));let file;if(url.searchParams.has('thumb'))file=item.thumbPath?localPath(item.thumbPath):path.join(pub,item.photo.thumb);else{file=path.join(data,'pool/previews',item.id+'.jpg');try{await access(file);}catch{await render(localPath(item.originalPath),file,2200);}}const info=await stat(file);res.writeHead(200,{'Content-Type':'image/jpeg','Content-Length':info.size,'Cache-Control':'private, max-age=3600'});createReadStream(file).pipe(res);return true;}
   return false;
  }
  if(req.method!=='POST')return false;
  if(publishing()&&!['/api/publish/check'].includes(route))throw Error('Your website update is running. Wait for it to finish before editing.');
  if(syncJob?.status==='running'&&!['/api/publish/check'].includes(route))throw Error('The photo sync is running. You can continue browsing; editing resumes when it finishes.');
  if(route==='/api/draft'){const value=JSON.parse((await body(req,4*1024*1024)).toString());if(Array.isArray(value)||value.expectedRevision!==digest(await draft()))throw Error('This draft changed in another Studio window. Reopen Studio to load the latest saved arrangement before editing. Your edits have not overwritten it.');const next=await validate(value.collections);await saveDraft(next);send(200,{ok:true,draftRevision:digest(next)});return true;}
  if(route==='/api/projects'){const value=JSON.parse((await body(req)).toString()),title=String(value.title||'').trim().slice(0,100);if(!title)throw Error('Give your project a name.');const list=await draft();let id=normalize(title).replace(/^$/,'project');id=title.normalize('NFKD').toLowerCase().replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'project';let base=id,n=2;while(list.some(x=>x.id===id))id=base+'-'+n++;const item={id,title,description:'',cover:null,photos:[]};list.push(item);await saveDraft(list);send(201,item);return true;}
  if(route==='/api/pool/add'){const value=JSON.parse((await body(req,1024*1024)).toString()),list=await draft(),project=list.find(p=>p.id===value.projectId);if(!project)throw Error('Choose a project.');if(!Array.isArray(value.ids)||value.ids.length>500)throw Error('Select up to 500 photographs at a time.');const chosen=await Promise.all([...new Set(value.ids)].map(getItem));let added=0;for(const item of chosen){if(inProject(item,project))continue;const photo=await materialize(item);project.photos.push(photo);project.cover ||= photo.src;added++;}await saveDraft(list);send(200,{added,projectId:project.id,title:project.title});return true;}
  if(route==='/api/upload')throw Error('Import photographs into the pool first, then add them to a project.');
  if(route==='/api/pool/upload'){
   const bytes=await body(req,50*1024*1024);if(!bytes.length)throw Error('Choose a photograph.');let filename;try{filename=decodeURIComponent(req.headers['x-file-name']||'Photograph.jpg');}catch{throw Error('Invalid filename.');}if(!/\.(jpg|jpeg|png|webp|heic|heif|tif|tiff)$/i.test(filename))throw Error('Use JPEG, PNG, WebP, HEIC or TIFF photographs.');
   const inbox=path.join(data,'upload-inbox',randomUUID()+path.extname(filename));await mkdir(path.dirname(inbox),{recursive:true});await writeFile(inbox,bytes);let result;try{result=await ingest(inbox,filename);}finally{await rm(inbox,{force:true});}
   if(route==='/api/upload'){const list=await draft(),p=list.find(x=>x.id===url.searchParams.get('project'));if(!p)throw Error('Unknown project.');const photo=await materialize(result.item);if(!inProject(result.item,p))p.photos.push(photo);p.cover ||= photo.src;await saveDraft(list);send(201,photo);}else send(201,{id:result.item.id,duplicate:result.duplicate});return true;
  }
  if(route==='/api/publish/prepare'){const snapshot=await draft(),l=await live(true);if(!l.ok&&process.env.STUDIO_TEST_MODE!=='1')throw Error('Connect to the internet so the app can compare your draft with the live site.');if(!snapshot.length)throw Error('Keep at least one project on your website.');if(snapshot.some(p=>!p.photos.length))throw Error('Add photographs to empty projects, or remove those projects from the draft before publishing.');const changes=diff(l.collections,snapshot);if(!changes.length)throw Error('Your draft already matches the live site.');if(process.env.STUDIO_TEST_MODE!=='1'){if(await git(['status','--porcelain','--untracked-files=no']))throw Error('The publishing checkout has unsaved file changes. Review those before updating the website.');await git(['ls-remote','--exit-code','origin','refs/heads/main']);}const id=randomUUID();plans.set(id,{snapshot,hash:digest(snapshot),liveHash:digest(l.collections),created:Date.now()});send(200,{id,changes,projects:snapshot.length,photos:snapshot.reduce((n,p)=>n+p.photos.length,0)});return true;}
  if(route==='/api/publish'){const v=JSON.parse((await body(req)).toString()),plan=plans.get(v.planId);if(!plan||Date.now()-plan.created>15*60*1000||plan.hash!==digest(await draft()))throw Error('Your draft changed. Review the update again.');const currentLive=await live(true);if(!currentLive.ok||digest(currentLive.collections)!==plan.liveHash)throw Error('The live website changed after your review. Review this update again before publishing.');plans.delete(v.planId);job={id:randomUUID(),status:'preparing',message:'Starting your website update…',startedAt:new Date().toISOString()};await persistJob();await atomic(path.join(data,'publish-history',job.id+'.json'),{...job,snapshot:plan.snapshot,previousLive:currentLive.collections});send(202,job);void publish(plan.snapshot);return true;}
  if(route==='/api/publish/check'){if(job?.status==='verification-pending'){await updateJob('deploying','Checking the live website…');void verifyDeployment();}send(200,job);return true;}
  if(route==='/api/pool/sync-inbox'){const manifest=await read(path.join(data,'photos-inbox/manifest.json'),[]);syncJob={status:'running',total:manifest.length,completed:0,added:0,duplicates:0,errors:[]};send(202,syncJob);void(async()=>{for(const record of manifest){try{const file=path.join(data,'photos-inbox',path.basename(record.file));const result=await ingest(file,record.filename,'photos',record.id);syncJob[result.duplicate?'duplicates':'added']++;await rm(file,{force:true});}catch(e){syncJob.errors.push({filename:record.filename,error:e.message});}syncJob.completed++;}syncJob.status='complete';await atomic(path.join(data,'last-photos-sync.json'),syncJob);})();return true;}
  return false;
 }
 return {handle,pool,state,validate,draft,preview,saveDraft,publishing};
}
