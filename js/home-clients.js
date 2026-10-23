'use strict';
(() => {
  const root = document.querySelector('.clients-showcase');
  if (!root) return;
  const viewport = root.querySelector('.clients-window');
  const track = root.querySelector('.clients-track');
  const pause = root.querySelector('[data-clients-pause]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const originals = [...track.children];
  const rows = [document.createElement('div'), document.createElement('div')];
  rows.forEach(row => row.className = 'clients-row');
  originals.forEach((item, i) => rows[i % 2].appendChild(item));
  track.replaceChildren(...rows);
  const rowItems = rows.map(row => [...row.children]);
  // Each row repeats independently for seamless movement in opposite directions.
  rows.forEach((row, index) => {
    for (let group = 0; group < 2; group++) {
      rowItems[index].forEach(item => {
        const clone = item.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.querySelectorAll('img').forEach(img => { img.alt = ''; img.loading = 'eager'; });
        row.appendChild(clone);
      });
    }
  });
  let paused = reduced.matches, focused = false;
  let offset = 0, span = 0, lastTime = 0, pending = 0, touchX = null;
  function paint() {
    if (!span) return;
    offset = ((offset % span) + span) % span;
    rows[0].style.transform = `translate3d(${-span - offset}px,0,0)`;
    rows[1].style.transform = `translate3d(${-span + offset}px,0,0)`;
  }
  function measure() {
    span = rows[0].children[rowItems[0].length].offsetLeft - rows[0].children[0].offsetLeft;
    paint();
  }
  function update() {
    if (!pause) return;
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Reanudar carrusel' : 'Pausar carrusel');
  }
  function move(direction) {
    const step = (rows[0].children[1].offsetLeft - rows[0].children[0].offsetLeft) * 2;
    if (reduced.matches) { offset += direction * step; paint(); }
    else pending += direction * step;
  }
  function animate(time) {
    const dt = Math.min((time - (lastTime || time)) / 1000, .05);
    lastTime = time;
    if (!document.hidden) {
      if (Math.abs(pending) > .1) {
        const distance = pending * Math.min(1, dt * 10);
        offset += distance; pending -= distance;
      } else pending = 0;
      if (!paused && !focused && touchX === null) offset += 42 * dt;
      paint();
    }
    requestAnimationFrame(animate);
  }
  root.querySelector('[data-clients-prev]')?.addEventListener('click', () => move(-1));
  root.querySelector('[data-clients-next]')?.addEventListener('click', () => move(1));
  pause?.addEventListener('click', () => { paused = !paused; update(); });
  root.addEventListener('focusin', () => focused = true);
  root.addEventListener('focusout', e => focused = root.contains(e.relatedTarget));
  viewport.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); move(e.key === 'ArrowRight' ? 1 : -1); }
  });
  viewport.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; pending = 0; }, { passive: true });
  viewport.addEventListener('touchmove', e => {
    if (touchX === null) return;
    offset += touchX - e.touches[0].clientX;
    touchX = e.touches[0].clientX; paint();
  }, { passive: true });
  ['touchend', 'touchcancel'].forEach(event => viewport.addEventListener(event, () => touchX = null));
  reduced.addEventListener('change', () => { paused = reduced.matches; update(); });
  new ResizeObserver(measure).observe(viewport);
  measure(); update(); requestAnimationFrame(animate);
})();
