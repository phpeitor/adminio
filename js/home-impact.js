'use strict';
(() => {
  const section = document.querySelector('.home-impact');
  if (!section) return;
  const counters = [...section.querySelectorAll('[data-count]')];
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const format = new Intl.NumberFormat('en-US');
  if (reduced.matches || !('IntersectionObserver' in window)) return;
  counters.forEach(el => el.textContent = '0');
  const observer = new IntersectionObserver(entries => {
    if (!entries.some(entry => entry.isIntersecting)) return;
    observer.disconnect();
    let start;
    function animate(time) {
      start ??= time;
      const progress = Math.min((time - start) / 1800, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counters.forEach(el => el.textContent = format.format(Math.round(Number(el.dataset.count) * eased)));
      if (progress < 1) requestAnimationFrame(animate);
    }
    requestAnimationFrame(animate);
  }, { threshold: .25 });
  observer.observe(section);
})();
