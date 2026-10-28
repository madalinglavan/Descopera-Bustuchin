/* Search uses text nodes for content and highlights, including untrusted imported text. */
'use strict';
window.initBustuchinSearch = ({ chapterGuide, chapterData }) => {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/ş/g, 's').replace(/ţ/g, 't').toLowerCase();
  chapterGuide.setAttribute('role', 'button');
  chapterGuide.setAttribute('tabindex', '0');
  chapterGuide.setAttribute('aria-haspopup', 'dialog');
  chapterGuide.setAttribute('aria-label', 'Caută în monografia comunei Bustuchin');
  const overlay = document.createElement('div');
  overlay.className = 'site-search'; overlay.hidden = true;
  overlay.innerHTML = `<div class="site-search__backdrop" data-search-close></div>
    <section class="site-search__panel" role="dialog" aria-modal="true" aria-labelledby="site-search-title">
      <header class="site-search__header"><span class="site-search__crest"><img src="img/logo.png" alt="" width="40" height="40"></span>
      <span><small>ATLASUL MONOGRAFIEI</small><strong id="site-search-title">Descoperă în pagină</strong></span>
      <button type="button" class="site-search__close" data-search-close aria-label="Închide căutarea">×</button></header>
      <label class="site-search__field"><input type="search" autocomplete="off" placeholder="Caută în texte, sate, persoane, evenimente…" aria-label="Caută în monografie"><kbd>ESC</kbd></label>
      <select class="search-chapter-filter" aria-label="Filtrează după capitol"><option value="">Toate capitolele</option></select>
      <div class="site-search__meta" role="status"><span>Rezultate din monografie</span><b></b></div>
      <div class="site-search__results" role="list"></div>
    </section>`;
  document.body.append(overlay);
  const input = overlay.querySelector('input');
  const filter = overlay.querySelector('select');
  const results = overlay.querySelector('[role="list"]');
  chapterData.forEach(chapter => {
    const option = document.createElement('option'); option.value = chapter.id; option.textContent = chapter.label; filter.append(option);
  });
  const entries = [];
  let generatedId = 0;
  document.querySelectorAll('main h2,main h3,main h4').forEach(heading => {
    const chapter = chapterData.find(c => c.element.contains(heading));
    if (!chapter) return;
    // Index the content following each heading, up to the next heading of equal/higher rank.
    if (!heading.id) {
      do { generatedId += 1; } while (document.getElementById(`reading-result-${generatedId}`));
      heading.id = `reading-result-${generatedId}`;
    }
    const range = document.createRange(); range.setStartAfter(heading);
    const following = [...chapter.element.querySelectorAll('h2,h3,h4')].find(other =>
      Number(other.tagName[1]) <= Number(heading.tagName[1]) && (heading.compareDocumentPosition(other) & Node.DOCUMENT_POSITION_FOLLOWING));
    if (following) range.setEndBefore(following); else range.setEndAfter(chapter.element.lastChild);
    const text = range.toString().replace(/\s+/g, ' ').trim();
    const title = heading.textContent.replace(/\s+/g, ' ').trim();
    entries.push({ id: heading.id, title, text, chapter, haystack: normalize(`${title} ${text} ${chapter.label}`) });
  });
  const highlight = (element, text, words) => {
    // Per-character normalization preserves indexes for decomposed Romanian diacritics.
    const chars = Array.from(text);
    const normalized = chars.map(normalize);
    const flags = chars.map(() => false);
    const flat = normalized.join('');
    const offsets = []; normalized.forEach((part, index) => { for (let i = 0; i < part.length; i++) offsets.push(index); });
    words.forEach(word => {
      let from = 0, found;
      while ((found = flat.indexOf(word, from)) !== -1) {
        for (let i = found; i < found + word.length; i++) flags[offsets[i]] = true;
        from = found + word.length;
      }
    });
    let start = 0;
    for (let i = 1; i <= chars.length; i++) {
      if (i === chars.length || flags[i] !== flags[start]) {
        const node = flags[start] ? document.createElement('mark') : document.createElement('span');
        node.textContent = chars.slice(start, i).join(''); element.append(node); start = i;
      }
    }
  };
  const render = () => {
    const words = normalize(input.value.trim()).split(/\s+/).filter(Boolean);
    const matches = entries.filter(item => (!filter.value || item.chapter.id === filter.value) && words.every(w => item.haystack.includes(w)));
    const shown = matches.slice(0, 30);
    overlay.querySelector('.site-search__meta b').textContent = `${matches.length} ${matches.length === 1 ? 'rezultat' : 'rezultate'}${matches.length > 30 ? ' · primele 30 afișate' : ''}`;
    results.replaceChildren();
    shown.forEach(item => {
      const link = document.createElement('a'); link.className = 'site-search__result'; link.href = `#${item.id}`; link.setAttribute('role', 'listitem');
      const body = document.createElement('span');
      const label = document.createElement('small'); label.textContent = item.chapter.label;
      const strong = document.createElement('strong'); highlight(strong, item.title, words);
      const em = document.createElement('em');
      const first = words.length ? normalize(item.text).indexOf(words[0]) : 0;
      const start = Math.max(0, first - 65);
      highlight(em, `${start ? '…' : ''}${item.text.slice(start, start + 230)}${item.text.length > start + 230 ? '…' : ''}`, words);
      body.append(label, strong, em); link.append(body); results.append(link);
    });
    if (!shown.length) { const p = document.createElement('p'); p.className = 'site-search__empty'; p.textContent = 'Niciun reper găsit. Încearcă alt termen sau alt capitol.'; results.append(p); }
  };
  let hideTimer;
  const open = () => {
    clearTimeout(hideTimer); overlay.hidden = false; document.body.classList.add('search-open');
    chapterGuide.setAttribute('aria-expanded', 'true'); render();
    requestAnimationFrame(() => { overlay.classList.add('is-open'); input.focus(); });
  };
  const close = () => {
    overlay.classList.remove('is-open'); document.body.classList.remove('search-open');
    chapterGuide.setAttribute('aria-expanded', 'false');
    hideTimer = setTimeout(() => { overlay.hidden = true; }, 220); chapterGuide.focus();
  };
  chapterGuide.addEventListener('click', open);
  chapterGuide.addEventListener('keydown', event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); open(); } });
  input.addEventListener('input', render); filter.addEventListener('change', render);
  overlay.addEventListener('click', event => { if (event.target.closest('[data-search-close],.site-search__result')) close(); });
  document.addEventListener('keydown', event => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); open(); }
    if (overlay.hidden) return;
    if (event.key === 'Escape') close();
    if (event.key === 'Tab') {
      const elements = [...overlay.querySelectorAll('button,input,select,a[href]')];
      const first = elements[0], last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    }
  });
  chapterGuide.setAttribute('aria-expanded', 'false');
};
