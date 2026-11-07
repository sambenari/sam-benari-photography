# Sam Benari — Street Photography

The live portfolio is at https://sambenari.com. GitHub Pages serves the static website from the root of this repository on `main`. The existing custom domain is preserved by `CNAME`, and `.nojekyll` keeps the export unprocessed.

The portfolio contains five projects and 239 photographs: Through the Window (30), Café Life (55), Soho (49), Rome (74) and Other Work (31). The homepage and galleries adapt to phone, tablet and desktop screens. Gallery photographs retain their original aspect ratios, with a thin black frame, selectable thumbnails, keyboard navigation and touch swipes.

## Edit photographs locally

The runnable source and photo manager are in `studio/`. Use Node.js 20 or newer on macOS, which provides the built-in `sips` image processor. No package installation is needed.

```sh
cd studio
npm start
```

Open http://127.0.0.1:4173 for the local preview and http://127.0.0.1:4173/manage for the photo manager. Upload photographs, arrange them, choose a cover, save drafts and apply the collection to your local preview. Drafts and uploaded originals stay in the ignored `studio/data/` folder; back that folder up separately. The public website has no upload endpoint or online editor.

## Prepare a website update

After applying edits to the local preview, run these commands from `studio/`:

```sh
npm run check
npm run build
node scripts/prepare-publication.mjs ..
```

The final command copies the public export into the repository root without committing or pushing anything. Review the changes, then commit and push `main` when you intend to update the live website. GitHub Pages performs the deployment. Preserve `CNAME` when changing the export.

The previous site’s `/about.html`, `/store.html` and `/project.html?p=...` URLs forward to the new pages. The legacy image folders remain available, and earlier versions of the website remain in Git history.

## Verify changes

With the local server running, `npm test` inside `studio/` checks the gallery assets and the upload/draft/cover workflow. It briefly changes preview data, restores the initial manifests, and removes its own temporary upload. Keep the manager closed during this check. See `studio/README.md` for further implementation details.
