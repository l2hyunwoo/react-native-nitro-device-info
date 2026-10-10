const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');
const { mkdtempSync, readFileSync, rmSync, writeFileSync } = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');

const packageRoot = path.resolve(__dirname, '..');
const swift = spawnSync('which', ['swiftc'], { encoding: 'utf8' }).stdout?.trim();
assert.ok(swift, 'Requires swiftc and Foundation (provided by Xcode on macOS)');

function run(command, args) {
  const result = spawnSync(command, args, { encoding: 'utf8', timeout: 120000 });
  assert.equal(result.error, undefined, String(result.error));
  assert.equal(result.status, 0, `${command}: ${result.stdout}\n${result.stderr}`);
}

test('iOS rejects malformed hashes and passes exactly 32 decoded bytes to App Attest', () => {
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
