# Sam Benari — photography website

A local rebuild of sambenari.com based on the two supplied designs. The static visitor website is published at sambenari.com from the repository root. This studio only updates local files until you explicitly commit and push prepared changes.

## Open the site

On this Mac, install Node.js 20 or newer if needed. No package installation is required: the app uses Node’s built-in modules and macOS’s built-in `sips` image processor.

```sh
cd studio
npm start
```

Open <http://127.0.0.1:4173> for the website and <http://127.0.0.1:4173/manage> for the photo manager. Keep the terminal running. Use `PORT=4174 npm start` if the default port is occupied. Stop with Control-C.

## Manage photographs

Choose a collection in the photo manager, then drop multiple JPEG, PNG or WebP files into the upload area (up to 25 MB per photograph). Uploads are immediately retained in the local draft. The manager creates a gallery image up to 2,200 pixels and a 440-pixel thumbnail, while retaining the uploaded original privately on this computer. Aspect ratios are preserved.

Drag cards to reorder them, or use each card’s left and right buttons. Choose **Set cover** to change its homepage tile. Edit image descriptions for accessibility. **Remove** takes a photograph out of the collection; its underlying file is retained. **Save draft** stores the arrangement without changing the visitor preview. **Apply to local preview** saves and makes that draft visible in the local website; refresh the preview tab to see it. **Discard draft** returns to the arrangement currently used in the preview. Switching collections keeps unsaved changes in the manager until you save or leave.

The manager only runs locally, with the server bound to this computer’s loopback address. It is not an internet-facing CMS and is excluded from the static export. It has no live-site credentials or deployment action. A hosted editor would need an authenticated publishing service before public deployment. Back up the entire project folder, including the private `data/` folder, to retain drafts and uploaded originals.

## Source photographs and Rome

The import downloaded every image listed in the current website’s public collection configuration: **Through the Window (30), Café Life (55), Soho (49), Other Work (31)**. Four original project covers, the existing homepage photograph and the About portrait were also downloaded. All 171 downloads succeeded. The homepage now uses the original Through the Window photograph 18 to suit the reference composition; the previous homepage photograph is also retained.

Rome now includes all **74 photographs** from `/Users/sambenari/AI Workspace/Sam Benari - Website/sambenari/projects/Rome`, bringing the five galleries to **239 photographs**. The original filenames determine the initial order. Gallery images are resized to a maximum of 2,200 pixels, with 440-pixel thumbnails; the source originals remain unchanged in that folder. The first photograph is the initial cover, which can be changed in the photo manager. `references/rome-import-report.json` records the imported filenames. No photographs were synthesized. Gallery image descriptions are numbered until you write specific descriptions in the manager.

`references/import-report.json` records the import results, and every imported gallery entry in `public/data/collections.json` retains its original source URL. The two supplied mockups are saved as `references/home.png` and `references/project.png`. The original configuration and supporting pages are retained in `references/`. The About biography and Store’s “prints coming soon” status were carried over from the existing site.

## Build and verify

```sh
npm run check
# With the local server running, and the manager closed while the test runs:
npm test
npm run build
```

The integration check uploads a real cached photograph to a temporary Rome draft, checks resizing, draft isolation, ordering, descriptions, cover selection, removal and local preview application, then restores the original collections and removes its own uploaded test files. It also checks routes, all current gallery assets and thumbnails, and rejection of invalid image data and unauthorized write requests. Run it before editing your own drafts; it temporarily changes local preview data during the check.

`npm run build` creates a static website in `dist/`, including real route folders for direct links. It excludes the manager and private originals. This produces files only; it does not publish them. After future photo edits, apply to the local preview and build again to refresh the export. Serve the export at a domain root; paths are root-relative. No analytics, remote font services or third-party image hosts are required by the rebuilt website.

Desktop and 390-pixel mobile views were visually checked, including portrait/landscape framing, thumbnail selection, arrows, collection controls and page overflow. Gallery photographs support keyboard arrows and touch swipes. The homepage uses a horizontal project strip on smaller screens; its arrows cycle the five tiles when all five fit on desktop. Reduced-motion preferences are respected.

## Main files

`public/app.js` and `public/style.css` define the visitor experience. `public/manage.js`, `public/manage.html` and `public/manage.css` define the local editor. `server.mjs` handles local files and the draft/upload endpoints. `public/data/collections.json` is the applied collection manifest; `data/draft.json` is created when a draft is saved. Uploaded originals are in `data/originals/`, and gallery renditions are in `public/assets/uploads/`.

The optional `scripts/import-originals.py` script reimports the old website and regenerates the manifest. It requires Python 3, curl and macOS sips. Do not rerun it after curating your collections unless you intend to reset the applied manifest to the original source list.
