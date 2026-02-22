/* ============================================================
   MAIN JS — navigation, footer, home page projects grid
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Footer year ---------------------------------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* --- Mobile nav toggle ---------------------------------- */
  const toggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      const open = toggle.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open);
    });

    // Close on link click (mobile)
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        toggle.classList.remove('open');
        navLinks.classList.remove('open');
      });
    });
  }

  /* --- Render projects grid (home page only) -------------- */
  const grid = document.getElementById('projectsGrid');
  if (!grid) return;

  if (typeof PROJECTS === 'undefined' || PROJECTS.length === 0) {
    grid.innerHTML = `
      <div class="no-projects">
        <h3>No projects yet</h3>
        <p>Add your first project by editing <code>js/projects.js</code></p>
      </div>`;
    return;
  }

  PROJECTS.forEach((project, i) => {
    const coverSrc = `projects/${project.folder}/cover.jpg`;
    const count = project.photos.length;

    const card = document.createElement('a');
    card.href = `project.html?p=${encodeURIComponent(project.folder)}`;
    card.className = 'project-card fade-in';
    card.style.animationDelay = `${i * 0.08}s`;
    card.setAttribute('aria-label', project.title);

    card.innerHTML = `
      <img src="${coverSrc}" alt="${project.title}" loading="${i < 4 ? 'eager' : 'lazy'}" />
      <div class="project-card-info">
        <p class="project-card-title">${project.title}</p>
        <p class="project-card-description">${project.description}</p>
        <p class="project-card-count">${count} photograph${count !== 1 ? 's' : ''}</p>
      </div>`;

    grid.appendChild(card);
  });

});
