const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { after, before, test } = require('node:test');
const { gzipSync } = require('node:zlib');
const tar = require('tar');
const { checkPackage } = require('./check-package.cjs');

const root = path.resolve(__dirname, '..');
const temporary = fs.mkdtempSync(
  path.join(os.tmpdir(), 'nitro-package-tests-')
);
const archives = new Map();
after(() => fs.rmSync(temporary, { recursive: true, force: true }));

before(() => {
  const npmVersion = execFileSync('npm', ['--version'], {
    encoding: 'utf8',
  }).trim();
  const [major, minor, patch] = npmVersion.split('.').map(Number);
  assert.ok(
    major > 11 ||
      (major === 11 && (minor > 5 || (minor === 5 && patch >= 1))),
    `Archive tests require npm >=11.5.1 to honor --ignore-scripts during pack; found ${npmVersion}`
  );
  for (const directory of [
    'react-native-nitro-device-info',
    'react-native-nitro-device-integrity',
    'mcp-server',
  ]) {
    const manifest = require(
      path.join(root, 'packages', directory, 'package.json')
    );
    execFileSync(
      'npm',
      ['pack', '--ignore-scripts', '--json', '--pack-destination', temporary],
      {
        cwd: path.join(root, 'packages', directory),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      }
    );
    archives.set(
      directory,
      path.join(
        temporary,
        `${manifest.name.replace(/^@/, '').replace('/', '-')}-${manifest.version}.tgz`
      )
    );
  }
});

function changedArchive(directory, change) {
  const fixture = fs.mkdtempSync(path.join(temporary, 'fixture-'));
  tar.x({
    file: archives.get(directory),
    cwd: fixture,
    sync: true,
    strict: true,
  });
  change(path.join(fixture, 'package'));
  const filename = path.join(fixture, 'changed.tgz');
  tar.c(
    { file: filename, cwd: fixture, gzip: true, sync: true, portable: true },
    ['package']
  );
  return filename;
}

test('validates all three real npm archives, including isolated Expo plugins and MCP index', () => {
  for (const [directory, filename] of archives) {
    const manifest = require(
      path.join(root, 'packages', directory, 'package.json')
    );
    assert.equal(
      checkPackage(filename),
      `${manifest.name}@${manifest.version}`
    );
  }
});

test('CLI accepts multiple archives and requires at least one', () => {
  const checker = path.join(__dirname, 'check-package.cjs');
  const output = execFileSync(
    process.execPath,
    [checker, ...archives.values()],
    { encoding: 'utf8' }
  );
  assert.equal(output.trim().split('\n').length, 3);
  assert.throws(
    () => execFileSync(process.execPath, [checker], { stdio: 'pipe' }),
    /Usage: node scripts\/check-package.cjs/
  );
});

test('validates from an unbuilt checkout without installed dependencies', () => {
  const checkout = fs.mkdtempSync(path.join(temporary, 'checkout-'));
  fs.mkdirSync(path.join(checkout, 'scripts'));
  fs.copyFileSync(
    path.join(__dirname, 'check-package.cjs'),
    path.join(checkout, 'scripts/check-package.cjs')
  );
  for (const directory of [
    'react-native-nitro-device-info',
    'react-native-nitro-device-integrity',
    'mcp-server',
  ]) {
    const source = path.join(root, 'packages', directory);
    fs.cpSync(source, path.join(checkout, 'packages', directory), {
      recursive: true,
      filter: (file) =>
        !/(^|\/)(node_modules|lib|dist|data|build|nitrogen)(\/|$)/.test(
          path.relative(source, file)
        ),
    });
  }
  fs.cpSync(path.join(root, 'docs/docs'), path.join(checkout, 'docs/docs'), {
    recursive: true,
  });
  const output = execFileSync(
    process.execPath,
    [path.join(checkout, 'scripts/check-package.cjs'), ...archives.values()],
    {
      cwd: checkout,
      encoding: 'utf8',
      env: { ...process.env, NODE_PATH: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    }
  );
  assert.equal(output.trim().split('\n').length, 3);
});

for (const [directory, file] of [
  ['react-native-nitro-device-info', 'ios/DeviceInfo.swift'],
  ['react-native-nitro-device-info', 'ios/PrivacyInfo.xcprivacy'],
  [
    'react-native-nitro-device-integrity',
    'android/src/main/java/com/margelo/nitro/nitrodeviceintegrity/DeviceIntegrity.kt',
  ],
  [
    'react-native-nitro-device-integrity',
    'nitrogen/generated/ios/NitroDeviceIntegrity+autolinking.rb',
  ],
  ['react-native-nitro-device-info', 'lib/typescript/src/index.d.ts'],
  ['react-native-nitro-device-info', 'src/DeviceInfo.nitro.ts'],
  ['react-native-nitro-device-info', 'plugin/build/withDeviceInfo.js'],
  ['react-native-nitro-device-integrity', 'app.plugin.js'],
  ['mcp-server', 'data/DeviceInfo.nitro.ts'],
  ['mcp-server', 'data/DeviceIntegrity.nitro.ts'],
  ['mcp-server', 'data/README.md'],
  ['mcp-server', 'data/docs'],
]) {
  test(`rejects ${directory} without ${file}`, () => {
    const filename = changedArchive(directory, (packageRoot) =>
      fs.rmSync(path.join(packageRoot, file), { recursive: true })
    );
    assert.throws(
      () => checkPackage(filename),
      (error) => error.message.includes(`missing ${file}`)
    );
  });
}

test('loads the packed Expo plugin instead of a workspace copy', () => {
  const filename = changedArchive(
    'react-native-nitro-device-integrity',
    (packageRoot) => {
      fs.writeFileSync(
        path.join(packageRoot, 'app.plugin.js'),
        "module.exports = require('./omitted-plugin.js');\n"
      );
    }
  );
  assert.throws(
    () => checkPackage(filename),
    /Cannot find module '.\/omitted-plugin.js'/
  );
});

test('requires usable packaged MCP specs even when workspace specs are available', () => {
  const filename = changedArchive('mcp-server', (packageRoot) => {
    fs.writeFileSync(
      path.join(packageRoot, 'data/DeviceIntegrity.nitro.ts'),
      'export interface DeviceIntegrity {}\n'
    );
  });
  assert.throws(
    () => checkPackage(filename),
    /Missing API: requestIntegrityToken/
  );
});

test('requires usable packaged MCP docs even when workspace docs are available', () => {
  const filename = changedArchive('mcp-server', (packageRoot) => {
    for (const file of fs.readdirSync(path.join(packageRoot, 'data/docs'), {
      recursive: true,
    })) {
      const target = path.join(packageRoot, 'data/docs', file);
      if (fs.statSync(target).isFile())
        fs.writeFileSync(target, 'No searchable headings\n');
    }
  });
  assert.throws(() => checkPackage(filename), /No packaged docs indexed/);
});

for (const field of ['name', 'version']) {
  test(`rejects a package with the wrong ${field}`, () => {
    const filename = changedArchive(
      'react-native-nitro-device-integrity',
      (packageRoot) => {
        const target = path.join(packageRoot, 'package.json');
        const manifest = JSON.parse(fs.readFileSync(target, 'utf8'));
        manifest[field] = field === 'name' ? 'unrecognized-package' : '999.0.0';
        fs.writeFileSync(target, JSON.stringify(manifest));
      }
    );
    assert.throws(
      () => checkPackage(filename),
      /Unknown package|package version differs/
    );
  });
}

for (const file of [
  'android/build/intermediates/output.o',
  'android/local.properties',
  'android/src/test/java/NativeRegression.kt',
  'android/src/androidTest/java/NativeRegression.kt',
  'src/__tests__/unpublished.test.ts',
  'node_modules/unwanted/index.js',
  'lib/previous.tgz',
]) {
  test(`rejects prohibited artifact ${file}`, () => {
    const filename = changedArchive(
      'react-native-nitro-device-info',
      (packageRoot) => {
        const target = path.join(packageRoot, file);
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, 'unwanted');
      }
    );
    assert.throws(() => checkPackage(filename), /Prohibited package artifact/);
  });
}

for (const entryPath of [
  'package/../../escape',
  '/absolute/path',
  'other/package.json',
  'package/back\\slash',
]) {
  test(`rejects unsafe archive path ${entryPath} before extraction`, () => {
    const header = new tar.Header({
      path: entryPath,
      type: 'File',
      size: 1,
      mode: 0o644,
    });
    header.encode();
    const filename = path.join(temporary, `unsafe-${Math.random()}.tgz`);
    fs.writeFileSync(
      filename,
      gzipSync(
        Buffer.concat([
          header.block,
          Buffer.from('x'),
          Buffer.alloc(511 + 1024),
        ])
      )
    );
    assert.throws(() => checkPackage(filename), /Unsafe archive path/);
  });
}

test('rejects symlinks before extraction', () => {
  const filename = changedArchive(
    'react-native-nitro-device-info',
    (packageRoot) => {
      fs.symlinkSync('/tmp', path.join(packageRoot, 'unsafe-link'));
    }
  );
  assert.throws(() => checkPackage(filename), /Unsupported archive entry/);
});

test('rejects hard links before extraction', () => {
  const filename = changedArchive(
    'react-native-nitro-device-info',
    (packageRoot) => {
      fs.linkSync(
        path.join(packageRoot, 'package.json'),
        path.join(packageRoot, 'unsafe-hardlink')
      );
    }
  );
  assert.throws(() => checkPackage(filename), /Unsupported archive entry/);
});

test('rejects empty prohibited directories', () => {
  const filename = changedArchive(
    'react-native-nitro-device-info',
    (packageRoot) => {
      fs.mkdirSync(path.join(packageRoot, 'node_modules'));
    }
  );
  assert.throws(
    () => checkPackage(filename),
    /Prohibited package artifact: node_modules/
  );
});
