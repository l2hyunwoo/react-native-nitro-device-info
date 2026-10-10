const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const { createRequire } = require('node:module');
const os = require('node:os');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const workspaces = [
  'react-native-nitro-device-info',
  'react-native-nitro-device-integrity',
  'mcp-server',
].map((directory) => path.join(root, 'packages', directory));

function filesIn(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    return entry.isDirectory() ? filesIn(file) : [file];
  });
}

function prohibited(file) {
  return (
    /(^|\/)(node_modules|coverage|__tests__|__fixtures__|__mocks__|__testfixtures__|\.[^/]+)(\/|$)/.test(
      file
    ) ||
    /(^|\/)(build|Pods|DerivedData)(\/|$)/.test(
      file.replace(/^plugin\/build(?:\/|$)/, '')
    ) ||
    /^android\/(gradle\/|gradlew(?:\.bat)?$|local\.properties$)/.test(file) ||
    /\.(tgz|log|tsbuildinfo|o|a|so|dylib|aar|apk)$/.test(file) ||
    /\.(test|spec)\.[cm]?[jt]sx?$/.test(file)
  );
}

function entryFiles(value) {
  if (typeof value === 'string') return [value];
  if (!value || typeof value !== 'object') return [];
  return Object.values(value).flatMap(entryFiles);
}

function checkPackage(filename) {
  const temporary = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-package-'));
  try {
    const archive = path.join(temporary, 'archive.tgz');
    fs.copyFileSync(filename, archive);
    const list = (flag) =>
      execFileSync('tar', [flag, archive], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 16 * 1024 * 1024,
      })
        .trimEnd()
        .split('\n')
        .filter(Boolean);
    const entries = list('-tzf');
    const details = list('-tvzf');
    assert.equal(
      entries.length,
      details.length,
      'Inconsistent archive listing'
    );
    const seen = new Set();
    const files = new Set();
    for (const [index, entry] of entries.entries()) {
      const name = entry.replace(/\/$/, '');
      assert.ok(
        name === 'package' ||
          (name.startsWith('package/') &&
            !name.includes('\\') &&
            [...name].every(
              (character) =>
                character.charCodeAt(0) >= 32 && character.charCodeAt(0) !== 127
            ) &&
            name
              .split('/')
              .every((part) => part && part !== '.' && part !== '..')),
        `Unsafe archive path: ${entry}`
      );
      assert.ok(
        ['-', 'd'].includes(details[index][0]) &&
          !/ -> | link to /.test(details[index]),
        `Unsupported archive entry: ${entry}`
      );
      assert.ok(!seen.has(name), `Duplicate archive entry: ${name}`);
      seen.add(name);
      if (name !== 'package') {
        const file = name.slice('package/'.length);
        assert.ok(!prohibited(file), `Prohibited package artifact: ${file}`);
        if (details[index][0] === '-') files.add(file);
      }
    }
    assert.ok(files.has('package.json'), 'Missing package.json');
    execFileSync(
      'tar',
      [
        '-xzf',
        archive,
        '-C',
        temporary,
        '--no-same-owner',
        '--no-same-permissions',
      ],
      { stdio: 'pipe' }
    );
    const packageRoot = path.join(temporary, 'package');
    const manifest = JSON.parse(
      fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8')
    );
    const workspace = workspaces.find(
      (directory) =>
        JSON.parse(
          fs.readFileSync(path.join(directory, 'package.json'), 'utf8')
        ).name === manifest.name
    );
    assert.ok(workspace, `Unknown package: ${manifest.name}`);
    const expected = JSON.parse(
      fs.readFileSync(path.join(workspace, 'package.json'), 'utf8')
    );
    assert.equal(
      manifest.version,
      expected.version,
      `${manifest.name}: package version differs from workspace`
    );

    const requireFile = (file) => {
      assert.ok(files.has(file), `${manifest.name}: missing ${file}`);
      assert.ok(
        fs.statSync(path.join(packageRoot, file)).size > 0,
        `${manifest.name}: empty ${file}`
      );
    };
    for (const field of ['main', 'types', 'exports', 'bin']) {
      assert.deepEqual(
        manifest[field],
        expected[field],
        `${manifest.name}: ${field} differs from workspace`
      );
      for (const entry of entryFiles(manifest[field])) {
        assert.ok(
          !entry.includes('*') && !entry.split('/').includes('..'),
          `Unsupported entry point: ${entry}`
        );
        requireFile(entry.replace(/^\.\//, ''));
      }
    }
    if (fs.existsSync(path.join(workspace, 'README.md')))
      requireFile('README.md');

    const requireTree = (directory, filter = () => true, optional = false) => {
      const source = path.join(workspace, directory);
      if (optional && !fs.existsSync(source)) return;
      assert.ok(
        fs.existsSync(source),
        `Build ${manifest.name} before checking its tarball: missing ${directory}`
      );
      const required = filesIn(source).filter((file) => {
        const relative = path
          .relative(workspace, file)
          .split(path.sep)
          .join('/');
        return !prohibited(relative) && filter(relative);
      });
      assert.ok(
        required.length,
        `${manifest.name}: empty ${directory} in workspace`
      );
      for (const file of required)
        requireFile(path.relative(workspace, file).split(path.sep).join('/'));
    };
    const requireCompiled = (source, javascript, types) => {
      for (const file of filesIn(path.join(workspace, source))) {
        const relative = path
          .relative(path.join(workspace, source), file)
          .split(path.sep)
          .join('/');
        if (
          prohibited(relative) ||
          !/\.tsx?$/.test(relative) ||
          relative.endsWith('.d.ts')
        )
          continue;
        requireFile(`${javascript}/${relative.replace(/\.tsx?$/, '.js')}`);
        if (types)
          requireFile(`${types}/${relative.replace(/\.tsx?$/, '.d.ts')}`);
      }
    };

    if (path.basename(workspace) === 'mcp-server') {
      requireCompiled('src', 'dist', 'dist');
      requireTree('dist', undefined, true);
      requireTree('data', undefined, true);
      for (const file of [
        'DeviceInfo.nitro.ts',
        'DeviceIntegrity.nitro.ts',
        'README.md',
      ])
        requireFile(`data/${file}`);
      for (const file of filesIn(path.join(root, 'docs/docs'))) {
        if (/\.mdx?$/.test(file))
          requireFile(
            `data/docs/${path.relative(path.join(root, 'docs/docs'), file).split(path.sep).join('/')}`
          );
      }
      execFileSync(
        process.execPath,
        [
          '-e',
          `
        const assert = require('node:assert/strict');
        const path = require('node:path');
        const packageRoot = process.argv[1];
        const { buildIndex, validateIndex, getDeviceInfoPath, getDeviceIntegrityPath } = require(path.join(packageRoot, 'dist/indexer/index.js'));
        const dist = path.join(packageRoot, 'dist');
        assert.equal(getDeviceInfoPath(dist), path.join(packageRoot, 'data/DeviceInfo.nitro.ts'));
        assert.equal(getDeviceIntegrityPath(dist), path.join(packageRoot, 'data/DeviceIntegrity.nitro.ts'));
        const index = buildIndex(dist);
        const validation = validateIndex(index);
        assert.ok(validation.valid, validation.errors.join('; '));
        for (const name of ['deviceId', 'requestIntegrityToken', 'attestKey', 'generateAssertion']) assert.ok(index.apis.has(name), 'Missing API: ' + name);
        assert.ok(index.chunks.some(chunk => chunk.source.startsWith(path.join(packageRoot, 'data/docs') + path.sep)), 'No packaged docs indexed');
        assert.ok(index.chunks.some(chunk => chunk.source === path.join(packageRoot, 'data/README.md')), 'No packaged README indexed');
      `,
          packageRoot,
        ],
        {
          cwd: temporary,
          env: { ...process.env, NODE_PATH: '' },
          stdio: 'pipe',
        }
      );
    } else {
      const nitro = JSON.parse(
        fs.readFileSync(path.join(workspace, 'nitro.json'), 'utf8')
      );
      const moduleName = nitro.ios.iosModuleName;
      for (const file of [
        'nitro.json',
        `${moduleName}.podspec`,
        'android/build.gradle',
        'android/CMakeLists.txt',
        'android/src/main/cpp/cpp-adapter.cpp',
        'app.plugin.js',
      ])
        requireFile(file);
      for (const directory of ['src', 'ios', 'android'])
        requireTree(directory, (file) => !file.endsWith('.md'));
      requireCompiled('src', 'lib/module', 'lib/typescript/src');
      requireCompiled('plugin/src', 'plugin/build');
      requireFile('lib/module/package.json');
      requireFile('lib/typescript/package.json');
      requireTree('lib', undefined, true);
      requireTree('plugin/build', undefined, true);
      requireTree('nitrogen/generated', undefined, true);
      for (const file of [
        `nitrogen/generated/ios/${moduleName}+autolinking.rb`,
        `nitrogen/generated/android/${nitro.android.androidCxxLibName}+autolinking.gradle`,
        `nitrogen/generated/android/${nitro.android.androidCxxLibName}+autolinking.cmake`,
      ])
        requireFile(file);
      for (const hybrid of Object.keys(nitro.autolinking)) {
        for (const file of [
          `shared/c++/Hybrid${hybrid}Spec.cpp`,
          `shared/c++/Hybrid${hybrid}Spec.hpp`,
          `ios/swift/Hybrid${hybrid}Spec.swift`,
          `ios/swift/Hybrid${hybrid}Spec_cxx.swift`,
          `ios/c++/Hybrid${hybrid}SpecSwift.hpp`,
          `ios/c++/Hybrid${hybrid}SpecSwift.cpp`,
          `android/c++/JHybrid${hybrid}Spec.cpp`,
          `android/c++/JHybrid${hybrid}Spec.hpp`,
          `android/kotlin/com/margelo/nitro/${nitro.android.androidNamespace.join('/')}/Hybrid${hybrid}Spec.kt`,
        ])
          requireFile(`nitrogen/generated/${file}`);
      }
      for (const file of files) {
        if (
          file === 'app.plugin.js' ||
          (file.startsWith('plugin/build/') && file.endsWith('.js'))
        ) {
          execFileSync(
            process.execPath,
            ['--check', path.join(packageRoot, file)],
            { stdio: 'pipe' }
          );
        }
      }
      let expo;
      try {
        expo = path.dirname(
          createRequire(path.join(workspace, 'package.json')).resolve(
            '@expo/config-plugins/package.json'
          )
        );
      } catch (error) {
        if (error.code !== 'MODULE_NOT_FOUND') throw error;
        // shortcut: Expo load smoke needs installed Expo; build CI runs it before publishing the same archive.
        console.error(
          `${manifest.name}: Expo load smoke skipped; @expo/config-plugins is not installed (syntax and contents checked)`
        );
        return `${manifest.name}@${manifest.version}`;
      }
      const scope = path.join(packageRoot, 'node_modules/@expo');
      fs.mkdirSync(scope, { recursive: true });
      fs.symlinkSync(expo, path.join(scope, 'config-plugins'), 'dir');
      execFileSync(
        process.execPath,
        [
          '-e',
          `
        const assert = require('node:assert/strict');
        const plugin = require(process.argv[1]);
        assert.equal(typeof plugin, 'function');
        const config = plugin({ name: 'package-smoke', slug: 'package-smoke', _internal: { projectRoot: process.cwd() } }, { enableSerialNumber: true, appAttest: true });
        assert.ok(config.mods && (config.mods.android || config.mods.ios), 'Plugin did not register a native mod');
      `,
          path.join(packageRoot, 'app.plugin.js'),
        ],
        {
          cwd: temporary,
          env: { ...process.env, NODE_PATH: '' },
          stdio: 'pipe',
        }
      );
    }
    return `${manifest.name}@${manifest.version}`;
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}

module.exports = { checkPackage };

if (require.main === module) {
  try {
    assert.ok(
      process.argv.length > 2,
      'Usage: node scripts/check-package.cjs <tarball.tgz> [more.tgz...]'
    );
    for (const filename of process.argv.slice(2))
      console.log(`Validated ${checkPackage(filename)}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
