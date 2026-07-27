// Progressive enhancement for /admin's photo grid: click a thumbnail to preview
// the full-size image before deciding to delete, and delete without a full-page
// reload so the scroll position isn't lost on a long grid. Without JS, both
// still work via plain navigation/form submits.
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('.admin-grid');
  if (!grid) return;

  const lightbox = document.createElement('div');
  lightbox.className = 'lightbox';
  lightbox.innerHTML = `
    <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
    <img class="lightbox-img" alt="">
  `;
  document.body.appendChild(lightbox);

  const lightboxImg = lightbox.querySelector('.lightbox-img');

  function openPreview(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
  }

  function closePreview() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }

  lightbox.querySelector('.lightbox-close').addEventListener('click', closePreview);
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closePreview();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closePreview();
  });

  grid.querySelectorAll('.admin-photo-thumb').forEach((img) => {
    img.addEventListener('click', () => openPreview(img.dataset.full, img.alt));
  });

  const countEl = document.querySelector('.admin-photo-count');

  grid.querySelectorAll('.admin-delete-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const card = form.closest('.admin-photo');
      try {
        const res = await fetch(form.action, { method: 'POST' });
        if (!res.ok) throw new Error('delete failed');
        card.remove();
        if (countEl) {
          const remaining = grid.querySelectorAll('.admin-photo').length;
          countEl.textContent = `${remaining} photo${remaining === 1 ? '' : 's'}`;
        }
      } catch {
        form.submit();
      }
    });
  });
});
