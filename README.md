# Sam Benari — Street Photography Website

## Quick Start

Open `index.html` in a browser. That's it for local viewing.

---

## How to Add a New Project

### Step 1 — Create the folder
Inside the `/projects/` directory, create a new folder named after your project.
Use hyphens instead of spaces:

```
projects/
  new-york-2024/
    cover.jpg       ← required: shown on home page
    img_001.jpg
    img_002.jpg
    img_003.jpg
    ...
```

**Images can be .jpg, .jpeg, .png, or .webp**  
The cover.jpg should ideally be landscape (4:3 ratio works best for the grid).

### Step 2 — Edit projects.js
Open `js/projects.js` and add your project to the `PROJECTS` array:

```js
{
  folder: "new-york-2024",     // ← must match your folder name exactly
  title:  "New York 2024",     // ← the name shown on the website
  photos: [                    // ← list every photo filename
    "img_001.jpg",
    "img_002.jpg",
    "img_003.jpg",
  ]
},
```

Put your newest project **first** in the list — projects appear in order.

### Step 3 — Done
Reload the page. Your project appears on the home page.

---

## How to Update the About Page

Open `about.html` and find this section:

```html
<div class="about-bio">
  <p>Your first paragraph here.</p>
  <p>Your second paragraph here.</p>
</div>
```

Replace the placeholder text with your own. Each `<p>` tag is a paragraph.

### Add your portrait photo
1. Put your photo in the project root as `images/portrait.jpg`
2. In `about.html`, find the `<div class="portrait-placeholder">` block
3. Replace the entire `<div class="portrait-placeholder">...</div>` with:
   ```html
   <img src="images/portrait.jpg" alt="Sam Benari" />
   ```

### Update your social media links
In `about.html` and also in `site-footer` across all pages, update:
- Instagram URL: `https://www.instagram.com/YOUR_USERNAME`
- Flickr URL: `https://www.flickr.com/photos/YOUR_USERNAME`

---

## File Structure

```
sambenari/
├── index.html          ← Home page (projects grid)
├── project.html        ← Individual project page (shared template)
├── about.html          ← About page
├── store.html          ← Store (under construction)
├── css/
│   └── style.css       ← All styles — edit colours/fonts here
├── js/
│   ├── projects.js     ← ⭐ YOUR MAIN EDIT FILE — add projects here
│   ├── main.js         ← Home page rendering + nav
│   └── project-detail.js ← Photo strip + lightbox
└── projects/
    ├── tokyo-nights/
    │   ├── cover.jpg
    │   └── 01.jpg ...
    └── london-streets/
        ├── cover.jpg
        └── img_001.jpg ...
```

---

## Hosting (free options)

### Netlify (recommended — simplest)
1. Go to https://netlify.com and sign up free
2. Drag your entire `sambenari/` folder onto the Netlify dashboard
3. Your site is live instantly with a URL like `sambenari.netlify.app`
4. To update: drag the folder again, or connect to GitHub for automatic deploys

### GitHub Pages
1. Push folder to a GitHub repository
2. Go to Settings → Pages → Source: main branch
3. Site available at `yourusername.github.io/repository-name`

---

## Customisation

### Colours
In `css/style.css`, find `:root` at the top:
```css
:root {
  --black: #0d0d0d;     /* main dark colour */
  --white: #f4f2ee;     /* warm off-white background */
  --mid:   #8a8680;     /* grey for labels, captions */
  --light: #d8d4ce;     /* borders and dividers */
}
```

### Fonts
The site uses **Cormorant Garamond** (serif, headings) and **DM Sans** (sans, UI text).
To change, update the Google Fonts link in each HTML file and the font variables in CSS:
```css
--serif: 'Cormorant Garamond', Georgia, serif;
--sans:  'DM Sans', system-ui, sans-serif;
```

---

## Notes

- All images are displayed in **greyscale** via CSS `filter: grayscale(100%)`. Your source files can be colour — the CSS handles the B&W conversion.
- The site works entirely without a server — it's pure HTML/CSS/JavaScript.
- For the lightbox: use **arrow keys** or **swipe** on mobile to navigate between photos.
