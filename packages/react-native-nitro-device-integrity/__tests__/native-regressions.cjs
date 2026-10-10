const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { existsSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const packageRoot = path.resolve(__dirname, '..');
const kotlin = spawnSync('which', ['kotlinc'], { encoding: 'utf8' }).stdout?.trim();
const kotlinRoot = kotlin && path.dirname(path.dirname(realpathSync(kotlin)));
const coroutines = kotlinRoot && ['lib', 'libexec/lib']
  .map((directory) => path.join(kotlinRoot, directory, 'kotlinx-coroutines-core-jvm.jar'))
  .find(existsSync);
const swift = spawnSync('which', ['swiftc'], { encoding: 'utf8' }).stdout?.trim();

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120000 });
  assert.equal(result.error, undefined, String(result.error));
  assert.equal(result.status, 0, `${command}: ${result.stdout}\n${result.stderr}`);
}

test('Android provider expiry retries once and preserves a concurrently refreshed provider', {
  skip: !coroutines || !existsSync(coroutines) ? 'Requires kotlinc with bundled kotlinx-coroutines-core-jvm.jar and a JDK' : false,
}, () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), 'integrity-kotlin-'));
  try {
    const source = readFileSync(path.join(packageRoot, 'android/src/main/java/com/margelo/nitro/nitrodeviceintegrity/DeviceIntegrity.kt'), 'utf8')
      .replace(/^package .*\n/gm, '')
      .replace(/^import (?:android\.|com\.).*\n/gm, '');
    const nativeFile = path.join(temp, 'DeviceIntegrity.kt');
    const jar = path.join(temp, 'regressions.jar');
    writeFileSync(nativeFile, source);
    run(kotlin, [nativeFile, path.join(__dirname, 'NativeRegression.kt'), '-cp', coroutines, '-include-runtime', '-d', jar]);
    run('java', ['-cp', `${jar}${path.delimiter}${coroutines}`, 'NativeRegressionKt']);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});

test('iOS rejects malformed hashes and passes exactly 32 decoded bytes to App Attest', {
  skip: !swift ? 'Requires swiftc and Foundation (provided by Xcode on macOS)' : false,
}, () => {
  const temp = mkdtempSync(path.join(os.tmpdir(), 'integrity-swift-'));
  try {
    const source = readFileSync(path.join(packageRoot, 'ios/DeviceIntegrity.swift'), 'utf8')
      .replace(/^import (?:NitroModules|DeviceCheck)\n/gm, '');
    const nativeFile = path.join(temp, 'DeviceIntegrity.swift');
    const binary = path.join(temp, 'regressions');
    writeFileSync(nativeFile, source);
    run(swift, ['-parse-as-library', nativeFile, path.join(__dirname, 'NativeRegression.swift'), '-o', binary]);
    run(binary, []);
  } finally {
    rmSync(temp, { recursive: true, force: true });
  }
});
