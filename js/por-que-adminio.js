"use strict";
async function loadWhyFragment(file, id) {
  const target = document.getElementById(id);
  try {
    const response = await fetch(`./${file}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    target.innerHTML = await response.text();
    if (id === 'site-header') {
      target.querySelectorAll('[data-section]').forEach(link => { link.href = `./index.html#${link.dataset.section}`; });
      target.querySelector('a[href="./por-que-adminio.html"]')?.setAttribute('aria-current', 'page');
    }
  } catch (error) {
    console.error(error);
    if (id === 'site-header') {
      const link = document.createElement('a');
      link.href = './index.html';
      link.textContent = 'ADMINIO · Volver al inicio';
      target.replaceChildren(link);
    }
  }
}
loadWhyFragment('head.html', 'site-header');
loadWhyFragment('footer.html', 'site-footer');
