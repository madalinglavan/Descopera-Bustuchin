document.addEventListener("DOMContentLoaded", () => {
  'use strict';
  const missing = window.bustuchinMissingAssets || new Set();
  const unavailable = path => missing.has(decodeURIComponent((path || '').split('#')[0]));
  document.querySelectorAll('.magazine-edition').forEach(button => {
    if (!unavailable(button.dataset.pdf)) return;
    button.disabled = true;
    button.classList.remove('active');
    button.title = 'În curs de completare — documentul nu este încă disponibil';
    const note = document.createElement('small');
    note.className = 'material-pending'; note.textContent = 'În curs de completare';
    button.append(note);
  });
  document.querySelectorAll('a[href],a[data-unavailable-href]').forEach(link => {
    const href = link.dataset.unavailableHref || link.getAttribute('href');
    if (!unavailable(href)) { if (link.dataset.unavailableHref) { link.href = href; link.removeAttribute('aria-disabled'); } return; }
    link.dataset.unavailableHref = href; link.removeAttribute('href');
    link.setAttribute('aria-disabled', 'true');
    const note = document.createElement('span');
    note.className = 'material-pending'; note.textContent = 'În curs de completare'; link.append(note);
  });
  const available = document.querySelector('.magazine-edition:not(:disabled)');
  if (available && !document.querySelector('.magazine-edition.active:not(:disabled)')) available.classList.add('active');
  const onImage = image => {
    if (image.dataset.fallbackChecked) return;
    image.dataset.fallbackChecked = 'true';
    const update = () => {
      if (image.naturalWidth) return;
      // Existing specialized galleries already supply their own accessible placeholder.
      if (image.closest('.memory-card,.memory-object,.memory-portrait,.memory-compare__image,.facility-card,.culture-house-card,.memory-slide')) return;
      image.hidden = true;
      const note = document.createElement('span');
      note.className = 'image-pending';
      note.textContent = `Fotografie în curs de completare${image.alt ? `: ${image.alt}` : ''}`;
      image.after(note);
    };
    image.addEventListener('error', update, { once: true });
    if (image.complete) update();
  };
  document.querySelectorAll('main img').forEach(onImage);
  const magazine = document.querySelector('.magazine-reader');
  if (magazine) {
    const note = document.createElement('p'); note.className = 'material-note';
    note.textContent = 'Edițiile marcate „În curs de completare” vor putea fi consultate după adăugarea documentelor în arhivă.';
    magazine.prepend(note);
  }
});
