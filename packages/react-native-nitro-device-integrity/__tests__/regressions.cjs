const assert = require('node:assert/strict');
const { createHash } = require('node:crypto');
const { readFileSync } = require('node:fs');
const { createRequire, Module } = require('node:module');
const path = require('node:path');
const { test } = require('node:test');
const ts = require('typescript');

const packageRoot = path.resolve(__dirname, '..');

function loadTypeScript(filename) {
  const compiled = new Module(filename, module);
  const localRequire = createRequire(filename);
  compiled.filename = filename;
  compiled.require = (id) => id.startsWith('.') && !path.extname(id)
    ? loadTypeScript(path.resolve(path.dirname(filename), `${id}.ts`))
    : localRequire(id);
  compiled._compile(ts.transpileModule(readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
    fileName: filename,
  }).outputText, filename);
  return compiled.exports;
}

test('availability check dependency is packaged at Android runtime', () => {
  const gradle = readFileSync(path.join(packageRoot, 'android/build.gradle'), 'utf8');
  assert.match(gradle, /implementation "com\.google\.android\.gms:play-services-base:/);
  assert.doesNotMatch(gradle, /compileOnly "com\.google\.android\.gms:play-services-base:/);
});

test('demo SHA-256 matches native crypto for UTF-8, padding, and surrogate vectors', async () => {
  const { sha256Base64 } = loadTypeScript(path.resolve(packageRoot, '../../example/integrity-demo/src/utils/hash.ts'));
  for (const input of ['', 'abc', 'a'.repeat(55), 'a'.repeat(56), 'a'.repeat(64), 'a'.repeat(1000), '안녕하세요 🌍', '\ud800', '\udc00', '\ud800a']) {
    assert.equal(await sha256Base64(input), createHash('sha256').update(input).digest('base64'));
  }
});

test('Expo plugin is opt-in and repeated prebuilds preserve unrelated entitlements', async () => {
  const plugin = loadTypeScript(path.join(packageRoot, 'plugin/src/withDeviceIntegrity.ts')).default;
  const disabled = plugin({ name: 'test', slug: 'test' });
  assert.equal(disabled.mods?.ios?.entitlements, undefined);

  const existing = { 'aps-environment': 'development' };
  const baseConfig = () => ({ name: 'test', slug: 'test', _internal: { projectRoot: packageRoot } });
  let config = plugin(baseConfig(), { appAttest: true });
  const firstMod = config.mods.ios.entitlements;
  config = plugin(config, { appAttest: true });
  assert.equal(config.mods.ios.entitlements, firstMod);
  const runMod = (cfg, modResults) => cfg.mods.ios.entitlements({
    ...cfg,
    modResults,
    modRequest: { platform: 'ios', modName: 'entitlements', projectRoot: packageRoot },
  });
  const first = await runMod(config, { ...existing });
  const second = await runMod(plugin(baseConfig(), { appAttest: true }), { ...first.modResults });
  assert.deepEqual(second.modResults, {
    ...existing,
    'com.apple.developer.devicecheck.appattest-environment': 'development',
  });
});
