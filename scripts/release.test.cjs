const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { test } = require('node:test');
const { prepare, verify, publish, readRegistry } = require('./release.cjs');

const sha = '1234567890abcdef1234567890abcdef12345678';
const env = {
  GITHUB_ACTIONS: 'true',
  GITHUB_EVENT_NAME: 'workflow_dispatch',
  GITHUB_REF: 'refs/heads/main',
  GITHUB_REPOSITORY: 'owner/repo',
  GITHUB_SHA: sha,
  RELEASE_PUBLISH: 'true',
};
const entries = [
  ['react-native-nitro-device-info', 'react-native-nitro-device-info'],
  [
    'react-native-nitro-device-integrity',
    'react-native-nitro-device-integrity',
  ],
  ['mcp-server', '@react-native-nitro-device-info/mcp-server'],
];

function fixture(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'nitro-release-test-'));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  const output = path.join(root, '.release');
  for (const [directory, name] of entries) {
    const target = path.join(root, 'packages', directory);
    fs.mkdirSync(target, { recursive: true });
    fs.writeFileSync(
      path.join(target, 'package.json'),
      JSON.stringify({ name, version: '1.0.0' })
    );
    fs.writeFileSync(
      path.join(target, 'CHANGELOG.md'),
      '# Changelog\n\n## 1.0.0\n\n- Fix one issue.\n\n## 0.9.0\n\n- Previous release.\n'
    );
  }
  const calls = [];
  const versions = new Map();
  const tags = new Map();
  const releases = new Set();
  let failure;
  let tagFailure;
  let dirty = false;
  const runner = (command, args, options = {}) => {
    calls.push([command, args]);
    if (command === 'git')
      return args[0] === 'status' ? (dirty ? ' M package.json' : '') : sha;
    if (command === 'yarn') return '';
    if (command === 'tar') return fs.readFileSync(args[1], 'utf8');
    if (command === process.execPath) return '';
    if (command === 'npm' && args[0] === 'pack') {
      const manifest = JSON.parse(
        fs.readFileSync(path.join(options.cwd, 'package.json'), 'utf8')
      );
      const filename = `${manifest.name.replace('@', '').replace('/', '-')}-${manifest.version}.tgz`;
      fs.writeFileSync(path.join(output, filename), JSON.stringify(manifest));
      return JSON.stringify([{ filename }]);
    }
    if (command === 'npm' && args[0] === 'publish') {
      const plan = JSON.parse(
        fs.readFileSync(path.join(output, 'manifest.json'), 'utf8')
      );
      const pkg = plan.packages.find(
        (entry) => entry.filename === path.basename(args[1])
      );
      if (pkg.name === failure) throw new Error('Injected npm failure');
      versions.set(pkg.name, {
        '1.0.0': { dist: { integrity: pkg.integrity } },
      });
      return '';
    }
    if (command === 'gh' && args.includes('--paginate'))
      return [...releases].join('\n');
    if (command === 'gh' && args[1].includes('/git/matching-refs/')) {
      const tag = decodeURIComponent(args[1].split('/tags/')[1]);
      return JSON.stringify(
        tags.has(tag)
          ? [{ ref: `refs/tags/${tag}`, object: { sha: tags.get(tag) } }]
          : []
      );
    }
    if (command === 'gh' && args.includes('POST')) {
      if (tagFailure) throw new Error('Injected tag failure');
      const tag = args
        .find((arg) => arg.startsWith('ref='))
        .slice('ref=refs/tags/'.length);
      tags.set(tag, sha);
      return '';
    }
    if (command === 'gh' && args[0] === 'release') {
      assert.equal(tags.get(args[2]), sha, 'Tag must precede GitHub Release');
      const name = args[2].slice(0, args[2].lastIndexOf('@'));
      assert.ok(
        versions.get(name)?.['1.0.0'],
        'Registry success must precede GitHub Release'
      );
      assert.equal(args.at(-1), '- Fix one issue.');
      releases.add(args[2]);
      return '';
    }
    throw new Error(`Unexpected test command: ${command} ${args}`);
  };
  return {
    root,
    output,
    calls,
    tags,
    releases,
    versions,
    runner,
    registry: async (name) =>
      versions.has(name) ? { name, versions: versions.get(name) } : null,
    setDirty: (value) => {
      dirty = value;
    },
    failPublish: (name) => {
      failure = name;
    },
    failTag: (value) => {
      tagFailure = value;
    },
  };
}

test('plans independent unpublished public versions and validates their archives', async (t) => {
  const f = fixture(t);
  f.versions.set(entries[0][1], { '1.0.0': {} });
  const privatePath = path.join(
    f.root,
    'packages',
    entries[1][0],
    'package.json'
  );
  const privateManifest = JSON.parse(fs.readFileSync(privatePath, 'utf8'));
  fs.writeFileSync(
    privatePath,
    JSON.stringify({ ...privateManifest, private: true })
  );
  const plan = await prepare(f.root, f.output, f);
  assert.deepEqual(
    plan.packages.map((pkg) => pkg.name),
    [entries[2][1]]
  );
  assert.equal(plan.sha, sha);
  assert.ok(
    f.calls.some(
      ([command, args]) =>
        command === process.execPath &&
        args.includes(path.join(f.root, 'scripts/check-package.cjs'))
    )
  );
  assert.ok(
    f.calls.every(
      ([command, args]) => command !== 'npm' || args[0] !== 'publish'
    )
  );
  assert.equal(f.tags.size, 0);
});

test('registry failures stop planning before build or pack', async (t) => {
  const f = fixture(t);
  await assert.rejects(
    prepare(f.root, f.output, {
      ...f,
      registry: async () => {
        throw new Error('HTTP 503');
      },
    }),
    /HTTP 503/
  );
  assert.deepEqual(
    f.calls.map(([command]) => command),
    ['git', 'git']
  );
});

test('404 is the only registry error treated as an absent package', async (t) => {
  const fetch = t.mock.method(global, 'fetch', async () => ({
    status: 404,
    ok: false,
  }));
  assert.equal(await readRegistry('example'), null);
  for (const status of [401, 403, 429, 500]) {
    fetch.mock.mockImplementation(async () => ({ status, ok: false }));
    await assert.rejects(readRegistry('example'), new RegExp(`HTTP ${status}`));
  }
  fetch.mock.mockImplementation(async () => {
    throw new Error('network unavailable');
  });
  await assert.rejects(readRegistry('example'), /network unavailable/);
  fetch.mock.mockImplementation(async () => ({
    status: 200,
    ok: true,
    json: async () => ({ name: 'example' }),
  }));
  await assert.rejects(readRegistry('example'), /Missing registry versions/);
});

test('tampered archive or commit is rejected before any publish', async (t) => {
  const f = fixture(t);
  const plan = await prepare(f.root, f.output, f);
  const archive = path.join(f.output, plan.packages[0].filename);
  fs.appendFileSync(archive, 'tampered');
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /Archive integrity mismatch/
  );
  assert.ok(
    f.calls.every(
      ([command, args]) => command !== 'npm' || args[0] !== 'publish'
    )
  );
  assert.throws(
    () =>
      verify(f.root, f.output, { ...f, env: { GITHUB_SHA: 'f'.repeat(40) } }),
    /Checkout must match/
  );
});

test('publish refuses ordinary pushes and disabled publish input', async (t) => {
  const f = fixture(t);
  await assert.rejects(
    publish(f.root, f.output, {
      ...f,
      env: { ...env, GITHUB_EVENT_NAME: 'push' },
    }),
    /manual dispatch/
  );
  await assert.rejects(
    publish(f.root, f.output, {
      ...f,
      env: { ...env, RELEASE_PUBLISH: 'false' },
    }),
    /explicit/
  );
  await assert.rejects(
    publish(f.root, f.output, {
      ...f,
      env: { ...env, GITHUB_REF: 'refs/heads/develop' },
    }),
    /from main/
  );
  assert.equal(f.calls.length, 0);
});

test('partial failure reruns skip exact archives and finish package tags/releases', async (t) => {
  const f = fixture(t);
  await prepare(f.root, f.output, f);
  f.failPublish(entries[1][1]);
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /Injected npm failure/
  );
  assert.deepEqual([...f.releases], [`${entries[0][1]}@1.0.0`]);
  f.failPublish(undefined);
  await publish(f.root, f.output, { ...f, env });
  assert.equal(f.tags.size, 3);
  assert.equal(f.releases.size, 3);
  const first = f.calls.filter(
    ([command, args]) =>
      command === 'npm' &&
      args[0] === 'publish' &&
      args[1].endsWith('react-native-nitro-device-info-1.0.0.tgz')
  );
  assert.equal(
    first.length,
    1,
    'A registry-confirmed version must never be republished'
  );
  for (const [, args] of f.calls.filter(
    ([command, args]) => command === 'npm' && args[0] === 'publish'
  )) {
    assert.ok(args[1].endsWith('.tgz'));
    assert.ok(args.includes('--ignore-scripts'));
    assert.ok(args.includes('--provenance'));
  }
});

test('failure after registry success recovers the missing tag without republishing', async (t) => {
  const f = fixture(t);
  await prepare(f.root, f.output, f);
  f.failTag(true);
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /Injected tag failure/
  );
  assert.equal(f.tags.size, 0);
  f.failTag(false);
  await publish(f.root, f.output, { ...f, env });
  assert.equal(f.releases.size, 3);
  assert.equal(
    f.calls.filter(
      ([command, args]) => command === 'npm' && args[0] === 'publish'
    ).length,
    3
  );
});

test('an existing version with another archive never receives release metadata', async (t) => {
  const f = fixture(t);
  await prepare(f.root, f.output, f);
  f.versions.set(entries[0][1], {
    '1.0.0': { dist: { integrity: 'sha512-different' } },
  });
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /Registry archive differs/
  );
  assert.equal(f.tags.size, 0);
  assert.equal(f.releases.size, 0);
  assert.equal(
    f.calls.filter(
      ([command, args]) => command === 'npm' && args[0] === 'publish'
    ).length,
    0
  );
});

test('local drafts are marked and cannot become publication artifacts', async (t) => {
  const f = fixture(t);
  f.setDirty(true);
  const plan = await prepare(f.root, f.output, f);
  assert.equal(plan.dirty, true);
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /clean source checkout/
  );
  await assert.rejects(
    prepare(f.root, f.output, { ...f, env }),
    /source checkout must be clean/
  );
});

test('pending changesets allow a dry run and block publication before versioning', async (t) => {
  const f = fixture(t);
  fs.mkdirSync(path.join(f.root, '.changeset'));
  fs.writeFileSync(
    path.join(f.root, '.changeset', 'pending.md'),
    '---\nreact-native-nitro-device-info: patch\n---\nA change.\n'
  );
  await prepare(f.root, f.output, f);
  await assert.rejects(
    publish(f.root, f.output, { ...f, env }),
    /Merge the Changesets version PR/
  );
  assert.equal(
    f.calls.filter(
      ([command, args]) => command === 'npm' && args[0] === 'publish'
    ).length,
    0
  );
  assert.equal(f.tags.size, 0);
});
