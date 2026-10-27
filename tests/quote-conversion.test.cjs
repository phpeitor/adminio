const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../js/contacto.js'), 'utf8');
// Execute the production tracking function and submit handler, without loading
// navigation/Ubigeo or contacting SMTP and Google during regression tests.
function setup({ response = { ok: true, json: async () => ({ ok: true }) }, tracking = 'normal', confirmed = true, valid = true } = {}) {
  const events = [];
  let requests = 0;
  let submitHandler;
  const statusBox = { focus() {} };
  const steps = [{}, {}];
  const context = {
    form: {
      elements: new Proxy({}, { get: () => ({ value: 'test' }) }),
      querySelectorAll: () => [{ value: 'Servicio' }],
      addEventListener: (_, handler) => { submitHandler = handler; }
    },
    steps, statusBox, currentStep: 1, sending: false, confirming: false, submitted: false,
    validate: () => valid, confirmContactSend: async () => confirmed,
    CONTACT_ENDPOINT: './cotizaciones/enviar.php',
    document: { getElementById: () => ({ textContent: '' }) },
    window: {}, console: { warn() {} }, AbortController,
    setTimeout: () => 1, clearTimeout() {},
    fetch: async () => { requests++; if (response instanceof Error) throw response; return response; }
  };
  if (tracking !== 'missing') context.window.gtag = (...args) => {
    if (tracking === 'throws') throw new Error('Analytics unavailable');
    events.push(args);
  };
  vm.createContext(context);
  vm.runInContext(source.slice(source.indexOf('function trackQuoteConversion()'), source.indexOf('function confirmContactSend()')), context);
  vm.runInContext(source.slice(source.indexOf('form.addEventListener("submit"')), context);
  return { events, statusBox, steps, context, requests: () => requests, submit: () => submitHandler({ preventDefault() {} }) };
}

test('confirmed success sends one conversion without personal data and blocks duplicate submits', async () => {
  const app = setup();
  await app.submit();
  await app.submit();
  assert.equal(app.requests(), 1);
  assert.deepEqual(JSON.parse(JSON.stringify(app.events)), [['event', 'conversion', {
    send_to: 'AW-18370877112/jcRjCP-8n6QdELit9bdE', value: 1, currency: 'PEN'
  }]]);
  assert.equal(app.steps[1].hidden, true);
  assert.match(app.statusBox.textContent, /Tu solicitud fue enviada/);
});

for (const [name, response] of [
  ['HTTP failure', { ok: false, json: async () => ({ ok: true }) }],
  ['unconfirmed response', { ok: true, json: async () => ({ ok: false }) }],
  ['invalid JSON', { ok: true, json: async () => { throw new Error('Invalid JSON'); } }],
  ['network failure', new Error('Network error')],
  ['timeout', Object.assign(new Error('Timeout'), { name: 'AbortError' })]
]) test(`${name} does not count a conversion and permits retry`, async () => {
  const app = setup({ response });
  await app.submit();
  assert.equal(app.events.length, 0);
  assert.equal(app.context.submitted, false);
  assert.equal(app.steps[1].disabled, false);
  assert.equal(app.statusBox.className, 'error');
});

for (const tracking of ['missing', 'throws']) test(`${tracking} analytics does not invalidate a successful request`, async () => {
  const app = setup({ tracking });
  await app.submit();
  await app.submit();
  assert.equal(app.requests(), 1);
  assert.match(app.statusBox.textContent, /Tu solicitud fue enviada/);
});

for (const options of [{ confirmed: false }, { valid: false }]) test(`cancelled or invalid form does not submit: ${JSON.stringify(options)}`, async () => {
  const app = setup(options);
  await app.submit();
  assert.equal(app.requests(), 0);
  assert.equal(app.events.length, 0);
});
