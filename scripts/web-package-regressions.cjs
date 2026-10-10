const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');
const { after, test } = require('node:test');
const vm = require('node:vm');

const root = path.resolve(__dirname, '..');
const packageDir = path.join(root, 'packages/react-native-nitro-device-info');
const { name, version } = require(path.join(packageDir, 'package.json'));
const { buildSync } = createRequire(
  path.join(root, 'example/showcase/package.json')
)('esbuild');
const consumer = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-web-package-'));
after(() => fs.rmSync(consumer, { recursive: true, force: true }));
fs.mkdirSync(path.join(consumer, 'node_modules'));
execFileSync('tar', [
  '-xzf',
  path.join(packageDir, `${name}-${version}.tgz`),
  '-C',
  consumer,
]);
fs.renameSync(
  path.join(consumer, 'package'),
  path.join(consumer, 'node_modules', name)
);

function bundle(entry, platform = 'browser', conditions = []) {
  return buildSync({
    stdin: {
      contents: `export * from '${entry}';`,
      resolveDir: consumer,
    },
    bundle: true,
    write: false,
    metafile: true,
    platform,
    mainFields:
      platform === 'browser'
        ? ['browser', 'main']
        : ['react-native', 'browser', 'main'],
    conditions,
    format: 'cjs',
    tsconfigRaw: {},
    external: ['react', 'react-native', 'react-native-nitro-modules'],
  });
}

async function loadWeb(result, battery) {
  const effects = [];
  const states = [];
  const timers = new Map();
  const module = { exports: {} };
  vm.runInNewContext(result.outputFiles[0].text, {
    module,
    exports: module.exports,
    ...(battery && {
      navigator: { getBattery: () => Promise.resolve(battery) },
    }),
    setInterval(callback) {
      const id = timers.size + 1;
      timers.set(id, callback);
      return id;
    },
    clearInterval: (id) => timers.delete(id),
    require(id) {
      if (id === 'react-native') return { Platform: { OS: 'web' } };
      assert.equal(id, 'react', 'web package must not import Nitro bindings');
      return {
        useState(value) {
          const slot = states.length;
          states.push(value);
          return [
            value,
            (next) => {
              states[slot] =
                typeof next === 'function' ? next(states[slot]) : next;
            },
          ];
        },
        useEffect: (effect) => effects.push(effect),
      };
    },
  });
  await Promise.resolve();
  return { api: module.exports, effects, states, timers };
}

for (const entry of [name, `${name}/compat`]) {
  for (const conditions of [[], ['source']]) {
    test(`${entry}: web hooks use the fallback (${conditions[0] || 'built'})`, async () => {
      const result = bundle(entry, 'browser', conditions);
      assert.equal(
        Object.keys(result.metafile.inputs).some((file) =>
          /\/(?:lib\/module\/index\.js|src\/index\.ts)$/.test(file)
        ),
        false,
        'internal imports must not select the native entry'
      );
      const battery = { level: 0.5, charging: false };
      const { api, effects, states, timers } = await loadWeb(result, battery);
      for (const hook of [
        'useBatteryLevel',
        'useBatteryLevelIsLow',
        'usePowerState',
        'useIsHeadphonesConnected',
        'useIsWiredHeadphonesConnected',
        'useIsBluetoothHeadphonesConnected',
        'useBrightness',
      ])
        api[hook]();
      const cleanups = effects.map((effect) => effect());
      assert.equal(states[0], 0.5);
      assert.equal(states[1], null);
      assert.equal(states[2].batteryLevel, 0.5);
      assert.equal(states[3], false);
      assert.equal(states[4], false);
      assert.equal(states[5], false);
      assert.equal(states[6], -1);
      battery.level = 0.1;
      for (const tick of timers.values()) tick();
      assert.equal(states[0], 0.1);
      assert.equal(states[1], 0.1);
      assert.equal(states[2].batteryLevel, 0.1);
      if (entry.endsWith('/compat')) {
        assert.equal(await api.getBatteryLevel(), 0.1);
        assert.equal(api.getBatteryLevelSync(), 0.1);
      }
      assert.equal(timers.size, 7);
      for (const cleanup of cleanups) cleanup();
      assert.equal(timers.size, 0);
    });
  }
}

test('web entry remains import-safe without browser globals', async () => {
  const { api, effects, states } = await loadWeb(bundle(name));
  assert.equal(api.DeviceInfoModule.getBatteryLevel(), -1);
  api.useBatteryLevel();
  const cleanup = effects[0]();
  assert.equal(states[0], null);
  cleanup();
});

for (const [platform, conditions] of [
  ['node', []],
  ['neutral', ['react-native']],
  ['neutral', ['react-native', 'source']],
]) {
  test(`native resolution retains native imports (${platform}, ${conditions})`, () => {
    for (const entry of [name, `${name}/compat`]) {
      const inputs = Object.keys(
        bundle(entry, platform, conditions).metafile.inputs
      );
      assert.ok(
        inputs.some((file) =>
          /\/(?:lib\/module\/index\.js|src\/index\.ts)$/.test(file)
        )
      );
      assert.equal(
        inputs.some((file) => /\/index\.web\.[jt]s$/.test(file)),
        false
      );
    }
  });
}
