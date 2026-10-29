(() => {
  // Keep local QA out of production statistics.
  if (['localhost', '127.0.0.1'].includes(location.hostname) || location.protocol === 'file:') return;
  const id = 110002258;
  window.ym = window.ym || function () { (window.ym.a = window.ym.a || []).push(arguments); };
  window.ym.l = Date.now();
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://mc.yandex.ru/metrika/tag.js';
  document.head.appendChild(script);
  window.ym(id, 'init', {clickmap: true, trackLinks: true, accurateTrackBounce: true});
  document.addEventListener('click', event => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (link.dataset.service) window.ym(id, 'reachGoal', 'service_select', {service: link.dataset.service});
    else if (/^https:\/\/t\.me\/isrmtnkv(?:\?|$|\/)/.test(href)) window.ym(id, 'reachGoal', 'contact_telegram');
    else if (href.startsWith('https://t.me/isrmtnkvbot')) window.ym(id, 'reachGoal', 'bonus_bot');
    else if (href.startsWith('mailto:')) window.ym(id, 'reachGoal', 'contact_email');
  });
})();
