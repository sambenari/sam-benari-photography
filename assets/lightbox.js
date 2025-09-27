document.addEventListener('click', (e) => {
  const a = e.target.closest('a[data-lightbox]'); if(!a) return;
  e.preventDefault();
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.innerHTML = `<img src="${a.getAttribute('href')}" alt=""><p>${a.getAttribute('data-caption')||''}</p>`;
  overlay.addEventListener('click', () => overlay.remove());
  document.body.appendChild(overlay);
});