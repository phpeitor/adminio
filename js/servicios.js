"use strict";
const servicesFavicon = document.querySelector('link[rel~="icon"]') || document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'icon' }));
servicesFavicon.type = 'image/png';
servicesFavicon.href = './static/favicon-torres.png?v=3';
async function loadServicesFragment(file, id) {
  const target = document.getElementById(id);
  try {
    const response = await fetch(`./${file}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    target.innerHTML = await response.text();
    if (id === 'site-header') {
      target.querySelectorAll('[data-section]').forEach(link => { link.href = `./index.html#${link.dataset.section}`; });
      target.querySelector('a[href="./servicios.html"]')?.setAttribute('aria-current', 'page');
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
loadServicesFragment('head.html', 'site-header');
loadServicesFragment('footer.html', 'site-footer');
