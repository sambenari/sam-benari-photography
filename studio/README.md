# Sam Benari Studio and photography website

The installed Mac app is **Sam Benari Studio** in Applications. Open it to manage the portfolio without a terminal. The **Website projects** tab lets you select a project and shows its live/draft photographs alongside the available pool. Additions always target the highlighted project and are reviewed by filename and thumbnail. It supports new projects, removal with undo, drag/arrow/position arrangement and covers, and has a reviewable **Update live site** workflow. The dark **Photo pool** contact sheet scrolls through all 2,061 photographs, with lazy thumbnails, live/draft membership, project and keyword filters, and multi-selection. Import files into the pool first; drag pool photographs into the selected white project panel to review their destination. Photos sync reads only the Street Photography album, as stated beside its button.

See [STUDIO_GUIDE.md](STUDIO_GUIDE.md) for the complete user guide, storage locations, backup and publishing behavior. The original website is at https://sambenari.com. Nothing is published just by opening the app or saving a draft.

The first Photos sync asks for macOS Photos permission. The existing imported pool is already available. The app is configured for this Mac and this workspace; keep the workspace folder in place, and back it up including its private `data/` directory. Private pool originals and unpublished photographs are excluded from the public website export.

## Commands

`npm start` runs the manager at http://127.0.0.1:4173/manage. `npm run check` checks the source. `npm test` runs isolated tests including a real build, commit and push to a temporary local Git remote; it never pushes the production repository. `npm run build` exports the currently applied public site to `dist/`. `npm run build:mac` builds the native app and creates `release/Sam Benari Studio.zip`. No package installation is required on this Mac.

The native launcher includes Node and the image-processing helper. App source is in `macos/`, backend behavior in `server.mjs` and `lib/studio.mjs`, and the studio interface in `public/manage.html`, `public/manage.js` and `public/manage.css`. The existing portfolio and slideshow remain in `public/app.js` and `public/style.css`.

## Photography sources

The initial portfolio has Through the Window (30), Café Life (55), Soho (49), Rome (74) and Other Work (31), totaling 239 gallery placements. Those gallery placements include some photographs used in several projects. The private pool combines the website imagery with the 2,050-photo screen-saver cache, using the original labels recovered from Photos and visual duplicate checks. The local review audit is in `audit/`. Its exported originals now live in `data/pool/originals/`, with a link retained for the audit viewer. The original Photos library and installed screen saver are unchanged.

The existing GitHub Pages publishing checkout remains in `publishing/`. The app prepares each update in a separate private checkout, stages only the generated public export and relevant runnable source, commits, pushes and verifies both the live release marker and exact reviewed project contents. Unrelated backup files in the publishing folder are not staged. Live publishing is an explicit two-step action inside the app: **Update live site**, then **Publish to sambenari.com** after review.
