const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const path = require('node:path');

// Evaluate emitted webpack factories, not source-level mocks. The minimal DOM
// only supports script loading and import-time feature detection; UI rendering
// remains covered by Angular tests and browser verification.
async function checkFederation(directory) {
  const context = vm.createContext({
    console,
    setTimeout,
    clearTimeout,
    URL,
    TextEncoder,
    TextDecoder,
    performance,
    ngDevMode: false,
    addEventListener() {},
    removeEventListener() {},
  });
  context.self = context;
  context.window = context;
  context.document = {
    currentScript: {
      tagName: 'SCRIPT',
      src: 'http://localhost/remoteEntry.js',
    },
    getElementsByTagName: () => [],
    createElement: () => ({
      setAttribute() {},
      getAttribute() {},
      parentNode: { removeChild() {} },
    }),
    head: {
      appendChild(script) {
        queueMicrotask(() => {
          try {
            const filename = path.join(
              directory,
              path.basename(script.src)
            );
            vm.runInContext(
              fs.readFileSync(filename, 'utf8'),
              context,
              { filename }
            );
            script.onload?.({ type: 'load', target: script });
          } catch (error) {
            console.error(error);
            script.onerror?.({ type: 'error', target: script });
          }
        });
      },
    },
  };
  let entry = fs.readFileSync(
    path.join(directory, 'remoteEntry.js'),
    'utf8'
  );
  // Bridge the emitted ESM container exports into an isolated script context.
  const exports = /export\{(\w+) as get,(\w+) as init\};?/;
  assert.match(
    entry,
    exports,
    'Expected ESM federation container exports'
  );
  entry = entry
    .replace(exports, 'globalThis.container={get:$1,init:$2};')
    .replaceAll(
      'import.meta.url',
      JSON.stringify('http://localhost/remoteEntry.js')
    );
  vm.runInContext(entry, context, { filename: 'remoteEntry.js' });
  await context.container.init({});
  const component = (await context.container.get('./Component'))();
  assert.equal(typeof component.App, 'function');
  assert.equal(component.default, component.App);
  assert.ok(
    component.App.ɵcmp,
    'Missing compiled component definition'
  );
  const routes = (await context.container.get('./Routes'))();
  assert.ok(Array.isArray(routes.Routes), 'Missing Routes exposure');
  console.log('PASS ./Component and ./Routes');
}

checkFederation(process.argv[2]).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
