const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { createRequire, Module } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const packageRoot = path.resolve(__dirname, '..');

function loadTypeScript(filename, overrides = {}) {
  const compiled = new Module(filename, module);
  const localRequire = createRequire(filename);
  compiled.filename = filename;
  compiled.require = (id) =>
    overrides[id] ??
    (id.startsWith('.') && !path.extname(id)
      ? loadTypeScript(
          path.resolve(path.dirname(filename), `${id}.ts`),
          overrides
        )
      : localRequire(id));
  compiled._compile(
    ts.transpileModule(readFileSync(filename, 'utf8'), {
      compilerOptions: {
        module: ts.ModuleKind.CommonJS,
        target: ts.ScriptTarget.ES2022,
        jsx: ts.JsxEmit.ReactJSX,
      },
      fileName: filename,
    }).outputText,
    filename
  );
  return compiled.exports;
}

function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}

// shortcut: state doubles cover async callbacks; use device UI tests for render scheduling.
function demoView(integrity, hash = async () => 'hash') {
  const states = [];
  const generation = { current: 0 };
  let slot = 0;
  const jsx = (type, props) => ({ type, props });
  const { default: App } = loadTypeScript(
    path.resolve(packageRoot, '../../example/integrity-demo/src/App.tsx'),
    {
      'react': {
        useMemo: (create) => create(),
        useRef: () => generation,
        useState: (initial) => {
          const index = slot++;
          if (!(index in states)) states[index] = initial;
          return [
            states[index],
            (value) => {
              states[index] = value;
            },
          ];
        },
      },
      'react/jsx-runtime': { jsx, jsxs: jsx },
      'react-native': {
        Platform: { OS: 'ios' },
        StyleSheet: { create: (styles) => styles },
      },
      'react-native-nitro-device-integrity': {
        createDeviceIntegrity: () => integrity,
      },
      './components/ResultCard': { ResultCard: 'ResultCard' },
      './utils/hash': { sha256Base64: hash },
    }
  );
  const nodes = (node) =>
    node && typeof node === 'object'
      ? [node, ...[node.props?.children].flat().flatMap(nodes)]
      : [];
  const section = nodes(App()).find(
    (node) => node.props?.integrity === integrity
  );
  return () => {
    slot = 0;
    const tree = nodes(section.type(section.props));
    return {
      press: (label) => {
        const button = tree.find((node) => node.props?.label === label);
        assert.ok(!button.props.disabled, `${label} is disabled`);
        return button.props.onPress();
      },
      state: (title) =>
        tree.find((node) => node.props?.title === title).props.state,
      assertionDisabled: tree.find(
        (node) => node.props?.label === '3. Generate assertion (per request)'
      ).props.disabled,
    };
  };
}

for (const [method, label] of [
  ['generateKey', '1. Generate key'],
  ['attestKey', '2. Attest key (once)'],
  ['generateAssertion', '3. Generate assertion (per request)'],
]) {
  for (const reject of [false, true]) {
    test(`demo ignores stale ${method} ${reject ? 'failure' : 'success'} after key replacement`, async () => {
      const pending = deferred();
      let keys = 0;
      let calls = 0;
      const integrity = {
        generateKey: () => {
          keys++;
          if (keys === 2 && method === 'generateKey') return pending.promise;
          return Promise.resolve(keys === 1 ? 'old-key' : 'new-key');
        },
        attestKey: () => {
          calls++;
          return method === 'attestKey'
            ? pending.promise
            : Promise.resolve('attestation');
        },
        generateAssertion: () => {
          calls++;
          return pending.promise;
        },
      };
      const view = demoView(integrity);
      await view().press('1. Generate key');
      if (method === 'generateAssertion')
        await view().press('2. Attest key (once)');
      const oldRequest = view().press(label);
      await Promise.resolve();
      if (method !== 'generateKey')
        assert.ok(calls > 0, 'Old native request must be pending');
      await view().press('1. Generate key');
      if (reject) pending.reject(new Error('old request failed'));
      else pending.resolve('old result');
      await oldRequest;
      assert.deepEqual(view().state('generateKey (keyId)'), {
        status: 'success',
        value: 'new-key',
      });
      assert.deepEqual(view().state('attestKey'), { status: 'idle' });
      assert.deepEqual(view().state('generateAssertion'), { status: 'idle' });
      assert.equal(view().assertionDisabled, true);
    });
  }
}

for (const [method, label] of [
  ['attestKey', '2. Attest key (once)'],
  ['generateAssertion', '3. Generate assertion (per request)'],
]) {
  test(`demo does not start stale ${method} after hashing finishes`, async () => {
    const hash = deferred();
    let hashing = false;
    const integrity = {
      generateKey: async () => 'key',
      attestKey: async () => {
        assert.ok(!hashing, 'Stale attestation must not start');
        return 'attestation';
      },
      generateAssertion: async () => {
        assert.fail('Stale assertion must not start');
      },
    };
    const view = demoView(integrity, () =>
      hashing ? hash.promise : Promise.resolve('hash')
    );
    await view().press('1. Generate key');
    if (method === 'generateAssertion')
      await view().press('2. Attest key (once)');
    hashing = true;
    const oldRequest = view().press(label);
    await view().press('1. Generate key');
    hash.resolve('hash');
    await oldRequest;
    assert.deepEqual(view().state('attestKey'), { status: 'idle' });
    assert.deepEqual(view().state('generateAssertion'), { status: 'idle' });
  });
}

test('availability check dependency is packaged at Android runtime', () => {
  const gradle = readFileSync(
    path.join(packageRoot, 'android/build.gradle'),
    'utf8'
  );
  assert.match(
    gradle,
    /implementation "com\.google\.android\.gms:play-services-base:/
  );
  assert.doesNotMatch(
    gradle,
    /compileOnly "com\.google\.android\.gms:play-services-base:/
  );
});

test('demo SHA-256 matches native crypto for UTF-8, padding, and surrogate vectors', async () => {
  const { sha256Base64 } = loadTypeScript(
    path.resolve(packageRoot, '../../example/integrity-demo/src/utils/hash.ts')
  );
  for (const input of [
    '',
    'abc',
    'a'.repeat(55),
    'a'.repeat(56),
    'a'.repeat(64),
    'a'.repeat(1000),
    '안녕하세요 🌍',
    '\ud800',
    '\udc00',
    '\ud800a',
  ]) {
    assert.equal(
      await sha256Base64(input),
      createHash('sha256').update(input).digest('base64')
    );
  }
});

test('Expo plugin is opt-in and repeated prebuilds preserve unrelated entitlements', async () => {
  const plugin = loadTypeScript(
    path.join(packageRoot, 'plugin/src/withDeviceIntegrity.ts')
  ).default;
  const disabled = plugin({ name: 'test', slug: 'test' });
  assert.equal(disabled.mods?.ios?.entitlements, undefined);

  const existing = { 'aps-environment': 'development' };
  const baseConfig = () => ({
    name: 'test',
    slug: 'test',
    _internal: { projectRoot: packageRoot },
  });
  let config = plugin(baseConfig(), { appAttest: true });
  const firstMod = config.mods.ios.entitlements;
  config = plugin(config, { appAttest: true });
  assert.equal(config.mods.ios.entitlements, firstMod);
  const runMod = (cfg, modResults) =>
    cfg.mods.ios.entitlements({
      ...cfg,
      modResults,
      modRequest: {
        platform: 'ios',
        modName: 'entitlements',
        projectRoot: packageRoot,
      },
    });
  const first = await runMod(config, { ...existing });
  const second = await runMod(plugin(baseConfig(), { appAttest: true }), {
    ...first.modResults,
  });
  assert.deepEqual(second.modResults, {
    ...existing,
    'com.apple.developer.devicecheck.appattest-environment': 'development',
  });
});
