"""One-time import from the public original site; never writes to the source site."""
import json, pathlib, urllib.request, urllib.parse, concurrent.futures, subprocess
ROOT=pathlib.Path(__file__).resolve().parent.parent
source=json.loads((ROOT/'references/source-collections.json').read_text())
slugs=['through-the-window','cafe-life','soho','other-work']
titles=['Through the Window','Café Life','Soho','Other Work']
jobs=[]; projects=[]
for original,slug,title in zip(source,slugs,titles):
    photos=[]
    for i,name in enumerate(original['photos']):
        rel=f'assets/{slug}/{i+1:03}.jpg'
        url='https://sambenari.com/projects/'+urllib.parse.quote(original['folder'])+'/'+urllib.parse.quote(name)
        jobs.append((url,rel)); photos.append({'id':f'{slug}-{i+1:03}','src':'/'+rel,'thumb':'/'+rel.replace('.jpg','-thumb.jpg'),'alt':f'{title} — photograph {i+1}','source':url})
    cover=f'assets/{slug}/cover.jpg'
    jobs.append(('https://sambenari.com/projects/'+urllib.parse.quote(original['folder'])+'/cover.jpg',cover))
    projects.append({'id':slug,'title':title,'description':original['description'],'cover':'/'+cover,'photos':photos})
jobs += [('https://sambenari.com/images/FrontPage.jpg','assets/hero.jpg'),('https://sambenari.com/images/Portrait.jpg','assets/portrait.jpg')]
def download(job):
    url,rel=job; path=ROOT/'public'/rel; path.parent.mkdir(parents=True,exist_ok=True)
    try:
        if not path.exists():
            content=subprocess.check_output(['curl','--fail','--retry','2','--max-time','45','-Ls',url])
            if content[:2]!=b'\xff\xd8': return (rel,'not JPEG')
            path.write_bytes(content)
        thumb=path.with_name(path.stem+'-thumb.jpg')
        if not thumb.exists(): subprocess.run(['sips','-Z','440',str(path),'--out',str(thumb)],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL,check=True)
        return (rel,'ok')
    except Exception as e: return (rel,str(e))
with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool: results=list(pool.map(download,jobs))
failures=[r for r in results if r[1]!='ok']
for p in projects:
    p['photos']=[photo for photo in p['photos'] if (ROOT/'public'/photo['src'].lstrip('/')).exists()]
    if not (ROOT/'public'/p['cover'].lstrip('/')).exists(): p['cover']=p['photos'][0]['src'] if p['photos'] else None
projects.insert(3,{'id':'rome','title':'Rome','description':'','cover':None,'photos':[]})
(ROOT/'public/data/collections.json').write_text(json.dumps(projects,indent=2,ensure_ascii=False))
(ROOT/'references/import-report.json').write_text(json.dumps({'source':'https://sambenari.com','downloaded':len(results)-len(failures),'failures':failures},indent=2))
print(json.dumps({'downloaded':len(results)-len(failures),'failures':failures,'collections':[(p['title'],len(p['photos'])) for p in projects]}))
