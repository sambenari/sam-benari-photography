"""Add the original Rome folder to the local preview, preserving other collections."""
import concurrent.futures, json, pathlib, subprocess, sys
ROOT=pathlib.Path(__file__).resolve().parent.parent
SOURCE=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else '/Users/sambenari/AI Workspace/Sam Benari - Website/sambenari/projects/Rome')
files=sorted((p for p in SOURCE.iterdir() if p.is_file() and p.suffix.lower() in {'.jpg','.jpeg','.png','.webp'}),key=lambda p:p.name.lower())
if not files: raise SystemExit('No Rome photographs found.')
output=ROOT/'public/assets/rome';output.mkdir(parents=True,exist_ok=True)
def prepare(original):
    target=output/(original.stem+'.jpg');thumb=output/(original.stem+'-thumb.jpg')
    if not target.exists():subprocess.run(['sips','-s','format','jpeg','-s','formatOptions','85','-Z','2200',str(original),'--out',str(target)],check=True,stdout=subprocess.DEVNULL)
    if not thumb.exists():subprocess.run(['sips','-Z','440',str(target),'--out',str(thumb)],check=True,stdout=subprocess.DEVNULL)
    return {'id':'rome-'+original.stem.lower(),'src':'/assets/rome/'+target.name,'thumb':'/assets/rome/'+thumb.name,'alt':'Rome — '+original.stem,'sourceFilename':original.name}
with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:photos=list(pool.map(prepare,files))
for manifest in [ROOT/'public/data/collections.json',ROOT/'data/draft.json']:
    if not manifest.exists():continue
    projects=json.loads(manifest.read_text());rome=next(p for p in projects if p['id']=='rome')
    known={p['id'] for p in rome['photos']};rome['photos'].extend(p for p in photos if p['id'] not in known)
    rome['cover']=rome.get('cover') or photos[0]['src']
    rome['description']='Street photographs from Rome.'
    temp=manifest.with_suffix('.tmp');temp.write_text(json.dumps(projects,indent=2,ensure_ascii=False)+'\n');temp.replace(manifest)
(ROOT/'references/rome-import-report.json').write_text(json.dumps({'sourceDirectory':str(SOURCE),'count':len(photos),'files':[p.name for p in files],'originals':'Unchanged in source directory','galleryMaxPixels':2200,'thumbnailMaxPixels':440},indent=2)+'\n')
print(f'Added {len(photos)} Rome photographs to the local preview and draft. Original files unchanged.')
