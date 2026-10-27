"use strict";
// Envío independiente del formulario antiguo y de su configuración privada.
const CONTACT_ENDPOINT = "./cotizaciones/enviar.php";
const form = document.getElementById("quote-form");
const steps = [document.getElementById("quote-step-1"), document.getElementById("quote-step-2")];
const statusBox = document.getElementById("quote-status");
let currentStep = 0;
let sending = false;
let confirming = false;
let submitted = false;

function trackQuoteConversion() {
  // Analytics failure must never turn a successful email into a retryable error.
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-18370877112/jcRjCP-8n6QdELit9bdE",
        value: 1.0,
        currency: "PEN"
      });
    }
  } catch (error) {
    console.warn("No se pudo registrar la conversión de cotización.");
  }
}

function confirmContactSend() {
  if (!window.alertify) return Promise.resolve(window.confirm("¿Desea enviar el mensaje?"));
  return new Promise(resolve => {
    window.alertify.confirm("Confirmación", "¿Desea enviar el mensaje?",
      () => resolve(true), () => resolve(false));
  });
}

async function loadFragment(file, id) {
  const response = await fetch(file);
  if (!response.ok) throw new Error(`No se pudo cargar ${file}`);
  document.getElementById(id).innerHTML = await response.text();
}
loadFragment("./head.html", "site-header").then(() => {
  document.querySelector("#v360-header > a").href = "./index.html";
  document.querySelectorAll("#site-header [data-section]").forEach(link => {
    link.href = `./index.html#${link.dataset.section}`;
  });
  document.querySelector('#site-header a[href="./contacto.html"]').setAttribute("aria-current", "page");
}).catch(console.error);
loadFragment("./footer.html", "site-footer").catch(console.error);

const regionSelect = form.elements.region;
const provinceSelect = form.elements.provincia;
const districtSelect = form.elements.distrito;
let provinces = [];
let districts = [];
let locationsReady = false;
const normalizeLocation = name => name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const regionLabels = new Map([...regionSelect.options].map(option => [normalizeLocation(option.value), option.value]));
const locationLabel = name => name.toLocaleLowerCase("es-PE").replace(/(^|\s)\S/g, letter => letter.toLocaleUpperCase("es-PE"));
function setLocationOptions(select, rows, key, placeholder) {
  select.replaceChildren(new Option(placeholder, ""));
  rows.forEach(row => {
    const label = key === "departamento" ? regionLabels.get(normalizeLocation(row[key])) || locationLabel(row[key]) : locationLabel(row[key]);
    const option = new Option(label, label);
    option.dataset.locationId = String(row.id);
    select.add(option);
  });
  select.disabled = rows.length === 0;
  select.setCustomValidity("");
  select.removeAttribute("aria-invalid");
}
function selectedLocationId(select) { return Number(select.selectedOptions[0]?.dataset.locationId); }
function updateProvinces() {
  setLocationOptions(provinceSelect, provinces.filter(row => row.departamento_id === selectedLocationId(regionSelect)), "provincia", "Selecciona una provincia");
  setLocationOptions(districtSelect, [], "distrito", "Selecciona una provincia primero");
}
function updateDistricts() {
  setLocationOptions(districtSelect, districts.filter(row => row.provincia_id === selectedLocationId(provinceSelect)), "distrito", "Selecciona un distrito");
}
async function loadLocations() {
  locationsReady = false;
  regionSelect.disabled = true;
  document.getElementById("location-error").hidden = true;
  try {
    const data = await Promise.all(["1_ubigeo_departamentos", "2_ubigeo_provincias", "3_ubigeo_distritos"].map(async file => {
      const response = await fetch(`./static/data/${file}.json`);
      if (!response.ok) throw new Error("No se pudo cargar el catálogo de ubicaciones");
      return response.json();
    }));
    const regions = data[0].ubigeo_departamentos;
    provinces = data[1].ubigeo_provincias;
    districts = data[2].ubigeo_distritos;
    if (![regions, provinces, districts].every(rows => Array.isArray(rows) && rows.length)) throw new Error("Catálogo de ubicaciones inválido");
    setLocationOptions(regionSelect, regions, "departamento", "Selecciona una región");
    regionSelect.value = "Lima";
    updateProvinces();
    locationsReady = true;
  } catch (error) {
    document.getElementById("location-error").hidden = false;
    console.error(error);
  }
}
regionSelect.addEventListener("change", updateProvinces);
provinceSelect.addEventListener("change", updateDistricts);
document.getElementById("location-retry").addEventListener("click", loadLocations);
loadLocations();

function validate(step) {
  if (step === steps[0] && !locationsReady) {
    document.getElementById("location-error").hidden = false;
    document.getElementById("location-retry").focus();
    return false;
  }
  let firstInvalid = null;
  step.querySelectorAll("input[required],select[required]").forEach(input => {
    input.setCustomValidity("");
    if (!input.value.trim()) input.setCustomValidity("Completa este campo.");
    const valid = input.checkValidity();
    input.setAttribute("aria-invalid", String(!valid));
    input.classList.toggle("input-error", !valid);
    if (!valid && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    if (window.alertify) window.alertify.error(firstInvalid.validationMessage || "Revisa los campos obligatorios.");
    firstInvalid.focus();
    return false;
  }
  if (step === steps[0]) {
    const selected = form.querySelector('input[name="servicios"]:checked');
    document.getElementById("services-error").hidden = Boolean(selected);
    const firstService = form.querySelector('input[name="servicios"]');
    firstService.classList.toggle("input-error", !selected);
    if (!selected) { firstService.focus(); return false; }
  }
  return true;
}
function showStep(index) {
  currentStep = index;
  steps.forEach((step, i) => { step.hidden = i !== index; step.disabled = i !== index; });
  document.querySelectorAll(".quote-progress li").forEach((item, i) => {
    item.removeAttribute("aria-current");
    if (i === index) item.setAttribute("aria-current", "step");
    item.classList.toggle("complete", i < index);
  });
  steps[index].querySelector("legend").focus();
}
form.addEventListener("input", event => {
  if (event.target.matches("input,select")) {
    event.target.setCustomValidity("");
    event.target.removeAttribute("aria-invalid");
    event.target.classList.remove("input-error");
  }
  if (event.target.name === "servicios") {
    document.getElementById("services-error").hidden = true;
    event.target.classList.remove("input-error");
  }
});
document.getElementById("quote-next").addEventListener("click", () => { if (validate(steps[0])) showStep(1); });
document.getElementById("quote-back").addEventListener("click", () => { statusBox.hidden = true; showStep(0); });
form.addEventListener("submit", async event => {
  event.preventDefault();
  if (sending || confirming || submitted) return;
  if (currentStep === 0) { if (validate(steps[0])) showStep(1); return; }
  if (!validate(steps[1])) return;
  confirming = true;
  let confirmed;
  try { confirmed = await confirmContactSend(); }
  finally { confirming = false; }
  if (!confirmed) return;
  const value = name => form.elements[name].value.trim();
  const services = [...form.querySelectorAll('input[name="servicios"]:checked')].map(input => input.value);
   const payload = { nombre:value("nombre"), edificio:value("edificio"), correo:value("correo"), telefono:value("telefono"), tipo:value("tipo"), unidades:value("unidades"), pisos:value("pisos"), sotanos:value("sotanos"), region:value("region"), provincia:value("provincia"), distrito:value("distrito"), servicios:services, cargo:value("cargo"), website:value("website") };
  sending = true;
  const submit = document.getElementById("quote-submit");
  submit.textContent = "Enviando…";
  steps[1].disabled = true;
  statusBox.hidden = true;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(CONTACT_ENDPOINT, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload), signal:controller.signal });
    if (response.status === 501) throw Object.assign(new Error("PHP no disponible"), { code:"preview_only" });
    const result = await response.json();
    if (!response.ok) throw Object.assign(new Error("El servidor no pudo procesar la solicitud"), { code:result.code });
    if (result.ok !== true) throw new Error("El servidor no confirmó el envío");
    submitted = true;
    trackQuoteConversion();
    statusBox.className = "";
    statusBox.textContent = "¡Gracias! Tu solicitud fue enviada. Nos pondremos en contacto contigo para preparar tu cotización.";
    steps[1].hidden = true;
    if (window.alertify) window.alertify.success("Mensaje enviado correctamente");
    // Keep confirmation visible and let the asynchronous Google tag finish.
  } catch (error) {
    steps[1].disabled = false;
    statusBox.className = "error";
    statusBox.textContent = error.name === "AbortError" ? "El servidor tardó demasiado y no pudimos confirmar el envío. Conservamos tus datos; contacta con comercial@adminio-peru.com antes de reenviar." : "No pudimos confirmar el envío. Conservamos tus datos para que puedas intentarlo de nuevo. También puedes escribir a comercial@adminio-peru.com.";
    if (error.code === "preview_only") statusBox.textContent = "Esta vista previa no ejecuta PHP ni envía correos. El envío estará disponible cuando se configure en el hosting.";
    if (error.code === "mail_not_configured") statusBox.textContent = "El envío de cotizaciones aún no está habilitado. Puedes escribir a comercial@adminio-peru.com.";
    if (error.code === "rate_limited") statusBox.textContent = "Espera un minuto antes de intentar nuevamente. Si persiste, contacta con comercial@adminio-peru.com.";
    if (window.alertify) window.alertify.error("No pudimos confirmar el envío del mensaje");
  } finally {
    clearTimeout(timeout);
    sending = false;
    submit.textContent = "Enviar";
    statusBox.hidden = false;
    statusBox.focus();
  }
});
