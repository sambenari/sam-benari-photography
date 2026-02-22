/* ============================================================
   PROJECT DETAIL JS — photo strip + lightbox
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* --- Identify project from URL (?p=folder-name) --------- */
  const params  = new URLSearchParams(window.location.search);
  const folder  = params.get('p');

  if (!folder || typeof PROJECTS === 'undefined') return;

  const project = PROJECTS.find(p => p.folder === folder);

  if (!project) {
    document.getElementById('projectTitle').textContent = 'Project not found';
    return;
  }

  /* --- Update page title & meta --------------------------- */
  document.title = `${project.title} — Sam Benari`;
  document.getElementById('projectTitle').textContent = project.title;
  const count = project.photos.length;
  document.getElementById('photoCount').textContent =
    `${count} photograph${count !== 1 ? 's' : ''}`;
  if (project.description) {
    document.getElementById('projectDescription').textContent = project.description;
  }

  /* --- Build photo strip ---------------------------------- */
  const strip = document.getElementById('photoStrip');
  const photos = project.photos;

  photos.forEach((filename, idx) => {
    const src = `projects/${project.folder}/${filename}`;
    const item = document.createElement('div');
    item.className = 'strip-item fade-in';
    item.style.animationDelay = `${Math.min(idx * 0.04, 0.4)}s`;
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Open photo ${idx + 1}`);
    item.tabIndex = 0;

    const img = document.createElement('img');
    img.src = src;
    img.alt = `${project.title} — ${idx + 1}`;
    img.loading = idx < 6 ? 'eager' : 'lazy';
    img.addEventListener('contextmenu', e => e.preventDefault());
    img.addEventListener('dragstart', e => e.preventDefault());

    item.appendChild(img);
    strip.appendChild(item);

    item.addEventListener('click', () => openLightbox(idx));
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') openLightbox(idx);
    });
  });

  /* ============================================================
     LIGHTBOX
     ============================================================ */

  const lightbox    = document.getElementById('lightbox');
  const lbImg       = document.getElementById('lightboxImg');
  const lbCounter   = document.getElementById('lightboxCounter');
  const lbClose     = document.getElementById('lightboxClose');
  const lbOverlay   = document.getElementById('lightboxOverlay');
  const lbPrev      = document.getElementById('lightboxPrev');
  const lbNext      = document.getElementById('lightboxNext');
  const lbSlideshow = document.getElementById('lightboxSlideshow');

  let currentIdx = 0;
  let slideshowInterval = null;
  let isPlaying = false;
  const SLIDESHOW_INTERVAL = 3000; // 3 seconds per photo

  function openLightbox(idx) {
    currentIdx = idx;
    showPhoto(idx);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    stopSlideshow();
  }

  function startSlideshow() {
    isPlaying = true;
    lbSlideshow.querySelector('.play-icon').style.display = 'none';
    lbSlideshow.querySelector('.pause-icon').style.display = 'inline';
    slideshowInterval = setInterval(() => {
      nextPhoto();
    }, SLIDESHOW_INTERVAL);
  }

  function stopSlideshow() {
    isPlaying = false;
    if (slideshowInterval) {
      clearInterval(slideshowInterval);
      slideshowInterval = null;
    }
    lbSlideshow.querySelector('.play-icon').style.display = 'inline';
    lbSlideshow.querySelector('.pause-icon').style.display = 'none';
  }

  function toggleSlideshow() {
    if (isPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  }

  function showPhoto(idx) {
    const src = `projects/${project.folder}/${photos[idx]}`;
    // Fade transition
    lbImg.style.opacity = '0';
    setTimeout(() => {
      lbImg.src = src;
      lbImg.alt = `${project.title} — ${idx + 1}`;
      lbImg.style.opacity = '1';
    }, 120);
    lbCounter.textContent = `${idx + 1} / ${photos.length}`;
    currentIdx = idx;
  }

  lbImg.style.transition = 'opacity 0.12s ease';

  function prevPhoto() {
    showPhoto((currentIdx - 1 + photos.length) % photos.length);
  }

  function nextPhoto() {
    showPhoto((currentIdx + 1) % photos.length);
  }

  lbClose.addEventListener('click', closeLightbox);
  lbOverlay.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevPhoto);
  lbNext.addEventListener('click', nextPhoto);
  lbSlideshow.addEventListener('click', toggleSlideshow);

  /* --- Project header slideshow button -------------------- */
  const projectSlideshowBtn = document.getElementById('projectSlideshowBtn');
  if (projectSlideshowBtn) {
    projectSlideshowBtn.addEventListener('click', () => {
      openLightbox(0);
      startSlideshow();
    });
  }

  /* --- Prevent image downloads ----------------------------- */
  lbImg.addEventListener('contextmenu', e => e.preventDefault());
  lbImg.addEventListener('dragstart', e => e.preventDefault());

  /* --- Keyboard navigation -------------------------------- */
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'ArrowLeft')  prevPhoto();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'Escape')     closeLightbox();
    // Prevent save shortcuts
    if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
    }
    // Prevent print
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
    }
  });

  /* --- Touch swipe for lightbox --------------------------- */
  let touchStartX = null;

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    if (touchStartX === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      dx < 0 ? nextPhoto() : prevPhoto();
    }
    touchStartX = null;
  });

});
