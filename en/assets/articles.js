(() => {
  const input = document.querySelector('#article-search');
  const grid = document.querySelector('#article-grid');
  if (input && grid) {
    const cards = [...grid.querySelectorAll('.article-card')];
    const filters = [...document.querySelectorAll('.category-filter')];
    const count = document.querySelector('#result-count');
    const more = document.querySelector('#show-more');
    const resetButton = document.querySelector('#reset-filters');
    const empty = document.querySelector('#empty-results');
    let category = 'all';
    let visibleLimit = 20;
    const normalize = text => text.toLocaleLowerCase('en').trim();
    const validCategories = new Set(filters.map(button => button.dataset.category));
    function readLocation() {
      const params = new URLSearchParams(location.search);
      category = validCategories.has(params.get('category')) ? params.get('category') : 'all';
      input.value = params.get('q') || '';
      visibleLimit = 20;
    }
    function updateLocation() {
      const address = new URL(location.href);
      address.search = '';
      if (category !== 'all') address.searchParams.set('category', category);
      if (input.value.trim()) address.searchParams.set('q', input.value.trim());
      history.replaceState(null, '', address);
    }
    function render(updateUrl = true) {
      const terms = normalize(input.value).split(/\s+/).filter(Boolean);
      const matching = cards.filter(card =>
        (category === 'all' || card.dataset.category === category) &&
        terms.every(term => normalize(card.dataset.search).includes(term)));
      cards.forEach(card => { card.hidden = true; });
      matching.slice(0, visibleLimit).forEach(card => { card.hidden = false; });
      filters.forEach(button => {
        const active = button.dataset.category === category;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      count.textContent = 'Found: ' + matching.length + ' · Showing: ' + Math.min(visibleLimit, matching.length);
      more.hidden = matching.length <= visibleLimit;
      more.textContent = 'Show ' + Math.min(20, Math.max(0,matching.length-visibleLimit)) + ' more guides ↓';
      empty.hidden = matching.length > 0;
      resetButton.hidden = category === 'all' && terms.length === 0;
      if (updateUrl) updateLocation();
    }
    function reset() { category = 'all'; input.value = ''; visibleLimit = 20; render(); input.focus(); }
    filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.category; visibleLimit = 20; render(); }));
    input.addEventListener('input', () => { visibleLimit = 20; render(); });
    resetButton.addEventListener('click', reset);
    document.querySelector('[data-reset]').addEventListener('click', reset);
    more.addEventListener('click', () => { visibleLimit += 20; render(false); });
    window.addEventListener('popstate', () => { readLocation(); render(false); });
    readLocation(); render(false);
  }
  document.querySelectorAll('.copy-worksheet').forEach(button => {
    button.addEventListener('click', async () => {
      const worksheet = button.closest('.worksheet');
      const status = worksheet.querySelector('.copy-status');
      const parts = [...worksheet.querySelectorAll('h3,p,li')].map(node => node.textContent.trim());
      try {
        await navigator.clipboard.writeText(parts.join('\n\n'));
        status.textContent = 'Worksheet copied.';
      } catch {
        const range = document.createRange();
        range.selectNodeContents(worksheet);
        const selection = window.getSelection();
        selection.removeAllRanges(); selection.addRange(range);
        status.textContent = 'Text selected. Copy it manually.';
      }
    });
  });
  const progress = document.querySelector('.reading-progress');
  const content = document.querySelector('.article-content');
  if (progress && content) {
    let pending = false;
    const update = () => {
      const start = content.getBoundingClientRect().top + scrollY - 100;
      const distance = Math.max(1,content.offsetHeight - innerHeight + 100);
      progress.style.width = Math.min(100,Math.max(0,(scrollY-start)/distance*100))+'%';
      pending = false;
    };
    window.addEventListener('scroll', () => { if (!pending) { pending=true; requestAnimationFrame(update); } }, {passive:true});
    window.addEventListener('resize', update); update();
  }
})();
