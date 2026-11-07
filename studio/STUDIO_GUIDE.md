# Sam Benari Studio

Open **Sam Benari Studio** from Applications. It starts its own local service and opens the manager in a Mac window; you do not need a terminal or browser to manage your photographs.

## Website projects

This tab shows the projects in your working draft. Each photograph is marked as live in that project, already elsewhere on the site, or draft only. Create a project with **New project**, then upload files or choose images from the photo pool. Rename collections, drag photographs into order, edit their descriptions and choose a homepage cover. Removing a photograph from a project keeps it in your pool.

**Save draft** keeps your arrangement on this Mac. **Preview draft** opens a visitor preview of that arrangement. Neither action changes sambenari.com.

**Update live site** compares the saved draft with the current live website. A review window lists additions, removals, new projects, covers and ordering changes. Choose **Publish to sambenari.com** only when you want those changes live. The app builds the public site, commits and pushes it to the existing photography repository, then watches for the live deployment to finish. Progress and any failure are shown in the app. Keep the app open while publishing.

Empty projects must be populated or removed from the draft before publishing. A photo removed from a live project stays live until you publish that change. The app only exports photographs used in the website, plus its existing homepage and portrait images; the rest of your pool and private originals are excluded.

## Photo pool

The pool starts with **2,061 photographs**, combining the existing website photographs with the screen-saver collection after visual duplicate checks. Photos with strong matching image content share a pool entry. Some have several existing website references or project labels, so pool counts and gallery placements differ.

Use the status filters to see what is already live, what is in your draft, what is available, or which images have possible website matches worth checking. Search filenames, titles or keywords. Click an image for a larger preview and metadata. Tick several photographs, choose a destination project at the bottom and click **Add selected to project**. Photographs already in that project are skipped. The **New project** shortcut beside the destination picker creates a named project directly from the pool; if photos are selected, they are added to the new project together.

Use **Import photographs**, or drop files into the pool, to add JPEG, PNG, WebP, HEIC or TIFF images (up to 50 MB each). The original is retained locally, keywords are read, duplicates are checked and preview images are generated automatically. Importing into a project also keeps the photograph in the pool.

**Sync from Photos** imports new or changed photos from the Street Photography album (also recognizing its existing “Street Photorgraphy” spelling). On the first sync, macOS asks for Photos access. The app deduplicates the result against your pool. Subsequent syncs skip unchanged Photos assets. Full Photos synchronization requires permission and a connection for any iCloud-only originals. It uses the Photos API and never edits the album. Embedded original keywords are used; adding a photograph to a website project remains your choice.

## Storage and backup

The app uses this existing Photography Website workspace as its library. Keep the workspace folder in place. Private originals, the photo index, drafts and publish history are in `data/`; public renditions and preview data are in `public/`. The publishing checkout is in `publishing/`. Back up the complete workspace, including `data/`, to preserve the library. The app bundle includes Node and the native image helper, so it does not require a package installation.

The previous audit review remains readable through its existing link; its labeled photo exports now live in `data/pool/originals/`, with a local link retained for the audit pages. The original Photos library and installed screen saver have not been modified.

## Development and verification

`npm start` runs the same manager locally. `npm run check` checks the source. `npm test` exercises project creation, imports, deduplication, ordering, cover changes, draft/preview separation, publishing review, stale review rejection, public export filtering and a complete build/commit/push against an isolated local Git repository. It does not publish to the real website. `npm run build:mac` builds and signs the Mac app in a temporary build folder and creates `release/Sam Benari Studio.zip`.

The app is built for use on this Mac with its existing website checkout and Git access. A different Mac would need its own local library path and publishing credentials configured. Photos synchronization requires its first-run access prompt; the existing imported pool is already available without granting new permission.
