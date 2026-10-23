"use strict";
async function loadAIFragment(file, id) {
  const target = document.getElementById(id);
  try {
    const response = await fetch(`./${file}`);
    if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
    target.innerHTML = await response.text();
    if (id === 'site-header') {
      target.querySelectorAll('[data-section]').forEach(link => { link.href = `./index.html#${link.dataset.section}`; });
      target.querySelector('a[href="./adminia.html"]')?.setAttribute('aria-current', 'page');
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
loadAIFragment('head.html', 'site-header');
loadAIFragment('footer.html', 'site-footer');
const aiExamples = {
  incidencias: ['«La luz del pasillo no enciende».', 'Describe lo ocurrido e indica la ubicación para orientar tu reporte al equipo de administración.'],
  pagos: ['«¿Cómo pago mi mantenimiento?».', 'Consulta los canales de pago de tu comunidad y los pasos para solicitar tu recibo.'],
  convivencia: ['«¿Dónde encuentro el manual?».', 'Encuentra orientación para consultar las reglas y los procedimientos de convivencia de tu edificio.']
};
document.querySelectorAll('[data-ai-topic]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-ai-topic]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  const [title, description] = aiExamples[button.dataset.aiTopic];
  document.getElementById('ai-topic-title').textContent = title;
  document.getElementById('ai-topic-description').textContent = description;
}));
const companion = document.querySelector('.ai-companion');
const companionTrigger = document.querySelector('.ai-companion-trigger');
document.querySelector('.ai-companion-minimize').addEventListener('click', () => {
  companion.classList.add('is-minimized');
  companionTrigger.focus();
});
