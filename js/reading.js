/* Personal reading preferences stay on this device. Storage may be unavailable. */
document.addEventListener("DOMContentLoaded", () => {
  'use strict';
  const chapters = ['istorie', 'geografie', 'sate', 'religie', 'patrimoniu', 'evenimente', 'turism', 'educatie', 'infrastructura']
    .map(id => document.getElementById(id)).filter(Boolean);
  const read = (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  };
  const save = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Session-only controls still work. */ }
  };
  let preferences = read('bustuchin-reading', {});
  if (!preferences || typeof preferences !== 'object') preferences = {};
  const rawBookmarks = read('bustuchin-bookmarks', []);
  const bookmarks = new Set(Array.isArray(rawBookmarks) ? rawBookmarks.filter(id => chapters.some(c => c.id === id)) : []);
  let current = chapters[0];
  const title = chapter => chapter?.querySelector('h2')?.textContent.replace(/\s+/g, ' ').trim() || chapter?.id || '';
  const applySize = () => {
    const size = [100, 112, 125].includes(preferences.size) ? preferences.size : 100;
    document.documentElement.dataset.readingSize = '100';
    document.querySelectorAll('main :is(.section-block__text,.village__text,.longform__text p,.history-card p)').forEach(element => {
      element.style.setProperty('--reading-base-font', getComputedStyle(element).fontSize);
    });
    document.documentElement.dataset.readingSize = String(size);
  };
  applySize();
  let sizeTimer;
  addEventListener('resize', () => { clearTimeout(sizeTimer); sizeTimer = setTimeout(applySize, 150); });
  const panel = document.createElement('section');
  panel.className = 'reading-tools';
  panel.setAttribute('aria-labelledby', 'reading-tools-title');
  panel.innerHTML = `<div class="reading-tools__identity"><small>În ritmul tău</small><h2 id="reading-tools-title">Lectura monografiei</h2></div>
    <div class="reading-tools__actions">
      <button type="button" data-save-position>Am rămas aici</button>
      <button type="button" data-resume disabled>Continuă</button>
      <label><span class="reading-tools__size-label">Text</span> <select aria-label="Mărimea textului"><option value="100">Aa</option><option value="112">Aa +</option><option value="125">Aa ++</option></select></label>
      <button type="button" data-reading-mode aria-pressed="false">Mod lectură</button>
      <details class="reading-tools__more"><summary>Mai multe</summary><div class="reading-tools__drawer">
        <button type="button" data-bookmark aria-pressed="false">Salvează capitolul</button>
        <nav class="reading-tools__bookmarks" aria-label="Capitole salvate"></nav>
        <a href="#despre-monografie">Surse și autori</a>
        <button type="button" data-clear-reading>Șterge poziția și semnele de carte</button>
        <p>Preferințele și poziția se păstrează în acest browser. Poziția se salvează numai când apeși „Am rămas aici”.</p>
      </div></details>
    </div><p class="reading-tools__status" role="status"></p>`;
  document.body.append(panel);
  const status = panel.querySelector('[role="status"]');
  const resume = panel.querySelector('[data-resume]');
  const bookmark = panel.querySelector('[data-bookmark]');
  const navbar = document.getElementById('navbar');
  const syncOffset = () => {
    const bottom = Math.max(0, navbar?.getBoundingClientRect().bottom || 0);
    panel.style.top = `${Math.ceil(bottom)}px`;
    document.documentElement.style.setProperty('--reading-fixed-bottom', `${Math.ceil(bottom + panel.offsetHeight)}px`);
  };
  new ResizeObserver(syncOffset).observe(panel);
  if (navbar) new ResizeObserver(syncOffset).observe(navbar);
  addEventListener('resize', syncOffset);
  addEventListener('scroll', syncOffset, { passive: true });
  syncOffset();
  const offset = () => panel.getBoundingClientRect().bottom + 16;
  window.bustuchinReadingOffset = offset;
  let last = read('bustuchin-reading-position', null);
  if (!last || typeof last !== 'object' || !document.getElementById(last.id)) last = null;
  const updateResume = () => {
    resume.disabled = !last;
    resume.title = last ? `Continuă lectura: ${title(document.getElementById(last.id))}` : 'Apasă „Am rămas aici” pentru a salva poziția';
  };
  // Stable per-section anchors survive reloads, font changes and different screen widths.
  const readingNodes = Array.from(document.querySelectorAll('main p,main h1,main h2,main h3,main h4,main li'));
  const indexes = new Map();
  readingNodes.forEach(node => {
    const area = node.closest('section[id]') || node.closest('main');
    const key = area.id;
    const index = indexes.get(key) || 0;
    indexes.set(key, index + 1);
    if (!node.id) node.id = `reading-line-${key}-${index}`;
  });
  const savePosition = () => {
    const line = offset();
    const visible = readingNodes.filter(node => node.getClientRects().length && getComputedStyle(node).visibility !== 'hidden');
    const node = visible.find(node => {
      const rect = node.getBoundingClientRect(); return rect.top <= line && rect.bottom > line;
    }) || visible.find(node => node.getBoundingClientRect().top >= line) || visible[visible.length - 1];
    if (!node) return;
    const area = node.closest('section[id]') || node.closest('main');
    const rect = node.getBoundingClientRect();
    last = { id: area.id, anchor: node.id, before: Math.max(0, rect.top - line), fraction: Math.max(0, Math.min(1, (line - rect.top) / Math.max(1, rect.height))), ratio: Math.max(0, Math.min(1, (scrollY + line - (area.getBoundingClientRect().top + scrollY)) / Math.max(1, area.offsetHeight))) };
    save('bustuchin-reading-position', last);
    updateResume();
    const saveButton = panel.querySelector('[data-save-position]');
    saveButton.textContent = 'Salvat ✓';
    setTimeout(() => { saveButton.textContent = 'Am rămas aici'; }, 1800);
    status.textContent = 'Poziție salvată. Revii aici apăsând „Continuă”.';
  };
  panel.querySelector('[data-save-position]').addEventListener('click', savePosition);
  resume.addEventListener('click', () => {
    if (!last) return;
    const saved = { ...last };
    window.navigateBustuchinToHash?.(`#${saved.id}`);
    const restore = () => {
      const area = document.getElementById(saved.id);
      const node = document.getElementById(saved.anchor);
      if (!area) return;
      const target = node || area;
      // Expand a saved paragraph when mobile reading has collapsed its parent.
      const collapsed = target.closest('.longform__text.is-collapsed');
      if (collapsed) {
        collapsed.classList.remove('is-collapsed');
        const toggle = collapsed.nextElementSibling;
        if (toggle?.classList.contains('longform__toggle')) { toggle.setAttribute('aria-expanded', 'true'); toggle.querySelector('span').textContent = 'Restrânge textul'; }
      }
      const rawRatio = node ? saved.fraction : saved.ratio;
      const ratio = Number.isFinite(rawRatio) ? Math.max(0, Math.min(1, rawRatio)) : 0;
      const before = node && Number.isFinite(saved.before) ? Math.max(0, Math.min(10000, saved.before)) : 0;
      const top = target.getBoundingClientRect().top + scrollY + target.getBoundingClientRect().height * ratio - offset() - before;
      window.scrollTo({ top: Math.max(0, top), behavior: 'instant' });
    };
    setTimeout(restore, 350);
    setTimeout(restore, 700);
    status.textContent = 'Ai revenit la poziția salvată.';
  });
  const mode = panel.querySelector('[data-reading-mode]');
  const applyMode = () => {
    document.documentElement.classList.toggle('book-reading', preferences.bookMode === true);
    mode.setAttribute('aria-pressed', String(preferences.bookMode === true));
    mode.textContent = preferences.bookMode ? 'Ieși din lectură' : 'Mod lectură';
  };
  mode.addEventListener('click', () => {
    preferences.bookMode = !preferences.bookMode;
    applyMode(); applySize(); save('bustuchin-reading', preferences);
    status.textContent = preferences.bookMode ? 'Mod lectură activat.' : 'Culorile obișnuite au fost restabilite.';
  });
  applyMode(); updateResume();
  const more = panel.querySelector('details');
  document.addEventListener('click', event => { if (!more.contains(event.target)) more.open = false; });
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && more.open) { more.open = false; more.querySelector('summary').focus(); } });
  panel.querySelector('select').value = document.documentElement.dataset.readingSize;
  panel.querySelector('select').addEventListener('change', event => {
    preferences.size = Number(event.target.value);
    applySize(); save('bustuchin-reading', preferences);
    status.textContent = 'Mărimea textului a fost actualizată.';
  });
  const renderBookmarks = () => {
    const nav = panel.querySelector('nav');
    nav.replaceChildren();
    chapters.filter(c => bookmarks.has(c.id)).forEach(chapter => {
      const link = document.createElement('a');
      link.href = `#${chapter.id}`; link.textContent = title(chapter); nav.append(link);
    });
    bookmark.setAttribute('aria-pressed', String(bookmarks.has(current?.id)));
    bookmark.textContent = bookmarks.has(current?.id) ? 'Elimină semnul de carte' : 'Salvează capitolul';
    document.querySelectorAll('.chapter-bookmark').forEach(button => {
      const saved = bookmarks.has(button.dataset.chapter);
      button.setAttribute('aria-pressed', String(saved));
      button.textContent = saved ? 'Elimină semnul de carte' : 'Salvează capitolul';
    });
  };
  bookmark.addEventListener('click', () => {
    if (!current) return;
    if (bookmarks.has(current.id)) bookmarks.delete(current.id); else bookmarks.add(current.id);
    save('bustuchin-bookmarks', [...bookmarks]); renderBookmarks();
    status.textContent = `${title(current)}: ${bookmarks.has(current.id) ? 'capitol salvat' : 'semn de carte eliminat'}.`;
  });
  // Place a compact shortcut in each chapter, close to the text being read.
  chapters.forEach(chapter => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'chapter-bookmark';
    button.dataset.chapter = chapter.id;
    button.textContent = 'Salvează capitolul';
    button.setAttribute('aria-label', `Salvează capitolul ${title(chapter)}`);
    const update = () => { button.setAttribute('aria-pressed', String(bookmarks.has(chapter.id))); };
    button.addEventListener('click', () => {
      current = chapter; bookmark.click(); update();
    });
    update();
    (chapter.querySelector('h2') || chapter).insertAdjacentElement('afterend', button);
  });
  // Scrolling updates the chapter shortcut, but never overwrites the saved position.
  let chapterTicking = false;
  addEventListener('scroll', () => {
    if (chapterTicking) return;
    chapterTicking = true;
    requestAnimationFrame(() => {
      const active = chapters.find(chapter => { const rect = chapter.getBoundingClientRect(); return rect.top <= offset() && rect.bottom > offset(); });
      if (active && active !== current) { current = active; renderBookmarks(); }
      chapterTicking = false;
    });
  }, { passive: true });
  panel.querySelector('[data-clear-reading]').addEventListener('click', () => {
    try { ['bustuchin-reading-position', 'bustuchin-bookmarks', 'bustuchinVisitedChapters'].forEach(key => { localStorage.removeItem(key); sessionStorage.removeItem(key); }); } catch {}
    dispatchEvent(new Event('bustuchin:clear-reading'));
    bookmarks.clear(); last = null; updateResume(); renderBookmarks();
    status.textContent = 'Poziția și semnele de carte au fost șterse. Poți salva din nou cu „Am rămas aici”.';
  });
  renderBookmarks();
});
