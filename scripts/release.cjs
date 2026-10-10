const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const registryUrl = 'https://registry.npmjs.org';
const packages = [
  {
    name: 'react-native-nitro-device-info',
    directory: 'packages/react-native-nitro-device-info',
    build: 'prepare',
  },
  {
    name: 'react-native-nitro-device-integrity',
    directory: 'packages/react-native-nitro-device-integrity',
    build: 'prepare',
  },
  {
    name: '@react-native-nitro-device-info/mcp-server',
    directory: 'packages/mcp-server',
    build: 'build',
  },
];

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    encoding: 'utf8',
    maxBuffer: 16 * 1024 * 1024,
    ...options,
  });
}

async function readRegistry(name) {
  const response = await fetch(`${registryUrl}/${encodeURIComponent(name)}`, {
    headers: {
      'Accept': 'application/vnd.npm.install-v1+json',
      'Cache-Control': 'no-cache',
    },
    signal: AbortSignal.timeout(30_000),
  });
  if (response.status === 404) return null;
  assert.ok(
    response.ok,
    `Registry lookup failed for ${name}: HTTP ${response.status}`
  );
  const result = await response.json();
  assert.equal(result.name, name, `Unexpected registry response for ${name}`);
  assert.ok(
    result.versions &&
      typeof result.versions === 'object' &&
      !Array.isArray(result.versions),
    `Missing registry versions for ${name}`
  );
  return result;
}

function publicPackages(root) {
  return packages.flatMap((entry) => {
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, entry.directory, 'package.json'), 'utf8')
    );
    if (manifest.private === true) return [];
    assert.equal(manifest.name, entry.name, 'Unexpected public package name');
    assert.match(
      manifest.version,
      /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/,
      `Expected stable release version for ${manifest.name}`
    );
    return [{ ...entry, name: manifest.name, version: manifest.version }];
  });
}

function filename(pkg) {
  return `${pkg.name.replace('@', '').replace('/', '-')}-${pkg.version}.tgz`;
}

function integrity(file) {
  return `sha512-${createHash('sha512').update(fs.readFileSync(file)).digest('base64')}`;
}

function sourceSha(root, runner, env) {
  const sha = runner('git', ['rev-parse', 'HEAD'], { cwd: root }).trim();
  assert.match(sha, /^[a-f0-9]{40}$/);
  if (env.GITHUB_SHA)
    assert.equal(
      sha,
      env.GITHUB_SHA,
      'Checkout must match the workflow commit'
    );
  return sha;
}

async function prepare(
  root,
  output,
  { registry = readRegistry, runner = run, env = process.env } = {}
) {
  const sha = sourceSha(root, runner, env);
  const dirty = !!runner('git', ['status', '--porcelain'], {
    cwd: root,
  }).trim();
  if (env.GITHUB_ACTIONS === 'true')
    assert.equal(dirty, false, 'Release source checkout must be clean');
  if (dirty)
    console.warn(
      'Local draft: uncommitted changes are included; the manifest SHA identifies the base commit only.'
    );
  const selected = [];
  for (const pkg of publicPackages(root)) {
    const published = await registry(pkg.name);
    if (published?.versions[pkg.version]) {
      console.log(`Already published: ${pkg.name}@${pkg.version}`);
    } else {
      selected.push(pkg);
    }
  }
  fs.mkdirSync(output, { recursive: true });
  const plan = { sha, dirty, packages: [] };
  for (const pkg of selected) {
    runner('yarn', ['workspace', pkg.name, pkg.build], {
      cwd: root,
      stdio: 'inherit',
    });
    const packed = JSON.parse(
      runner(
        'npm',
        ['pack', '--ignore-scripts', '--json', '--pack-destination', output],
        { cwd: path.join(root, pkg.directory) }
      )
    );
    assert.equal(packed.length, 1);
    assert.equal(packed[0].filename, filename(pkg));
    const archive = path.join(output, packed[0].filename);
    plan.packages.push({
      name: pkg.name,
      version: pkg.version,
      directory: pkg.directory,
      filename: packed[0].filename,
      integrity: integrity(archive),
    });
  }
  fs.writeFileSync(
    path.join(output, 'manifest.json'),
    `${JSON.stringify(plan, null, 2)}\n`
  );
  verify(root, output, { runner, env });
  console.log(JSON.stringify(plan, null, 2));
  return plan;
}

function verify(root, output, { runner = run, env = process.env } = {}) {
  const plan = JSON.parse(
    fs.readFileSync(path.join(output, 'manifest.json'), 'utf8')
  );
  assert.equal(
    plan.sha,
    sourceSha(root, runner, env),
    'Release artifact belongs to another commit'
  );
  assert.ok(Array.isArray(plan.packages));
  if (env.GITHUB_ACTIONS === 'true')
    assert.equal(
      plan.dirty,
      false,
      'Release artifact must come from a clean source checkout'
    );
  const allowed = publicPackages(root);
  const names = new Set();
  const archives = [];
  for (const pkg of plan.packages) {
    const expected = allowed.find((entry) => entry.name === pkg.name);
    assert.ok(
      expected && !names.has(pkg.name),
      `Unexpected or duplicate package: ${pkg.name}`
    );
    names.add(pkg.name);
    assert.equal(pkg.directory, expected.directory);
    assert.equal(pkg.version, expected.version);
    assert.equal(pkg.filename, filename(expected));
    const archive = path.join(output, pkg.filename);
    assert.ok(
      fs.lstatSync(archive).isFile(),
      `Expected a regular archive: ${pkg.filename}`
    );
    assert.equal(
      integrity(archive),
      pkg.integrity,
      `Archive integrity mismatch: ${pkg.filename}`
    );
    const packed = JSON.parse(
      runner('tar', ['-xOzf', archive, 'package/package.json'])
    );
    assert.equal(packed.name, pkg.name, 'Archive package name mismatch');
    assert.equal(
      packed.version,
      pkg.version,
      'Archive package version mismatch'
    );
    assert.notEqual(packed.private, true);
    archives.push(archive);
  }
  if (archives.length)
    runner(
      process.execPath,
      [path.join(root, 'scripts/check-package.cjs'), ...archives],
      { cwd: root, stdio: 'inherit' }
    );
  return plan;
}

function releaseNotes(root, pkg) {
  const file = path.join(root, pkg.directory, 'CHANGELOG.md');
  if (fs.existsSync(file)) {
    const changelog = fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const heading = `## ${pkg.version}\n`;
    const start = changelog.indexOf(heading);
    if (start !== -1) {
      const next = changelog.indexOf('\n## ', start + heading.length);
      return changelog
        .slice(start + heading.length, next === -1 ? undefined : next)
        .trim();
    }
  }
  return `Published ${pkg.name}@${pkg.version}.`;
}

async function verifyOidc(
  root,
  { env = process.env, request = fetch, log = console.log } = {}
) {
  assert.equal(
    env.GITHUB_ACTIONS,
    'true',
    'OIDC verification requires Actions'
  );
  assert.equal(env.GITHUB_EVENT_NAME, 'workflow_dispatch');
  assert.equal(env.GITHUB_REF, 'refs/heads/main');
  assert.equal(
    env.RELEASE_PUBLISH,
    'false',
    'Disable publish for OIDC verification'
  );
  assert.ok(
    env.ACTIONS_ID_TOKEN_REQUEST_URL && env.ACTIONS_ID_TOKEN_REQUEST_TOKEN
  );
  const audience = 'npm:registry.npmjs.org';
  const url = new URL(env.ACTIONS_ID_TOKEN_REQUEST_URL);
  url.searchParams.set('audience', audience);
  const identity = await request(url, {
    headers: { Authorization: `Bearer ${env.ACTIONS_ID_TOKEN_REQUEST_TOKEN}` },
    redirect: 'error',
    signal: AbortSignal.timeout(30_000),
  });
  assert.ok(identity.ok, `GitHub OIDC request failed: HTTP ${identity.status}`);
  const { value: idToken } = await identity.json().catch(() => {
    throw new Error('GitHub returned invalid OIDC JSON');
  });
  assert.ok(
    typeof idToken === 'string' && /^\S+$/.test(idToken),
    'Missing GitHub OIDC token'
  );
  log(`::add-mask::${idToken}`);
  const claims = JSON.parse(
    Buffer.from(idToken.split('.')[1], 'base64url').toString()
  );
  assert.equal(claims.iss, 'https://token.actions.githubusercontent.com');
  assert.equal(claims.aud, audience);
  assert.equal(claims.repository, env.GITHUB_REPOSITORY);
  assert.equal(claims.ref, 'refs/heads/main');
  assert.equal(claims.environment, 'npm');
  assert.equal(
    claims.workflow_ref,
    `${env.GITHUB_REPOSITORY}/.github/workflows/release.yml@refs/heads/main`
  );
  const results = [];
  for (const pkg of publicPackages(root)) {
    try {
      const escapedName = pkg.name.replaceAll('/', '%2f');
      const response = await request(
        `${registryUrl}/-/npm/v1/oidc/token/exchange/package/${escapedName}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${idToken}` },
          redirect: 'error',
          signal: AbortSignal.timeout(30_000),
        }
      );
      assert.ok(response.ok, `npm exchange failed: HTTP ${response.status}`);
      const body = await response.json().catch(() => {
        throw new Error('npm returned invalid exchange JSON');
      });
      assert.ok(
        typeof body.token === 'string' && /^\S+$/.test(body.token),
        'Missing npm exchange token'
      );
      log(`::add-mask::${body.token}`);
      assert.ok(body.token_type === 'oidc', 'Unexpected npm token type');
      if (body.expires !== undefined) {
        log(`${pkg.name}: npm expiry metadata type ${typeof body.expires}`);
        const expiresAt = new Date(
          typeof body.expires === 'number' ? body.expires * 1000 : body.expires
        ).getTime();
        assert.ok(
          Number.isFinite(expiresAt),
          'npm returned unsupported expiry metadata'
        );
        assert.ok(
          expiresAt > Date.now(),
          `npm exchange token expired at ${new Date(expiresAt).toISOString()}`
        );
      }
      results.push({
        name: pkg.name,
        status: response.status,
        ...(body.expires !== undefined && { expires: body.expires }),
      });
      log(`${pkg.name}: OIDC exchange succeeded (HTTP ${response.status})`);
    } catch (error) {
      results.push({ name: pkg.name, error: error.message });
      log(`${pkg.name}: ${error.message}`);
    }
  }
  if (env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(
      env.GITHUB_STEP_SUMMARY,
      [
        '## npm OIDC token exchange',
        '',
        ...results.map(
          (result) =>
            `- ${result.name}: ${result.error || `HTTP ${result.status}${result.expires ? `, expires ${result.expires}` : ''}`}`
        ),
        '',
        'Only token exchange was requested. No packages, dist-tags, Git tags, or GitHub Releases were changed.',
        '',
      ].join('\n')
    );
  }
  assert.ok(
    results.every((result) => !result.error),
    'One or more npm OIDC exchanges failed'
  );
  return results;
}

async function publish(
  root,
  output,
  {
    registry = readRegistry,
    runner = run,
    env = process.env,
    wait = delay,
  } = {}
) {
  assert.equal(
    env.GITHUB_ACTIONS,
    'true',
    'Publish only runs in GitHub Actions'
  );
  assert.equal(
    env.GITHUB_EVENT_NAME,
    'workflow_dispatch',
    'Publish requires manual dispatch'
  );
  assert.equal(
    env.GITHUB_REF,
    'refs/heads/main',
    'Publish only runs from main'
  );
  assert.equal(
    env.RELEASE_PUBLISH,
    'true',
    'Publish requires explicit RELEASE_PUBLISH=true'
  );
  assert.match(env.GITHUB_REPOSITORY || '', /^[\w.-]+\/[\w.-]+$/);
  const changesets = path.join(root, '.changeset');
  const pending = fs.existsSync(changesets)
    ? fs
        .readdirSync(changesets)
        .filter((file) => file.endsWith('.md') && file !== 'README.md')
    : [];
  assert.equal(
    pending.length,
    0,
    'Merge the Changesets version PR before publishing'
  );
  const plan = verify(root, output, { runner, env });
  const repo = `repos/${env.GITHUB_REPOSITORY}`;
  const releases = new Set(
    runner(
      'gh',
      ['api', '--paginate', `${repo}/releases`, '--jq', '.[].tag_name'],
      { cwd: root }
    )
      .trim()
      .split('\n')
  );
  for (const pkg of plan.packages) {
    let published = (await registry(pkg.name))?.versions[pkg.version];
    if (!published) {
      runner(
        'npm',
        [
          'publish',
          path.join(output, pkg.filename),
          '--ignore-scripts',
          '--provenance',
          '--access',
          'public',
          '--registry',
          registryUrl,
        ],
        { cwd: root, stdio: 'inherit' }
      );
      for (let attempt = 0; attempt < 6; attempt++) {
        if (attempt > 0) await wait(1_000 * 2 ** (attempt - 1));
        published = (await registry(pkg.name))?.versions[pkg.version];
        if (published) break;
      }
    }
    assert.equal(
      published?.dist?.integrity,
      pkg.integrity,
      `Registry archive differs or publication is not visible: ${pkg.name}@${pkg.version}`
    );
    const tag = `${pkg.name}@${pkg.version}`;
    const refs = JSON.parse(
      runner(
        'gh',
        ['api', `${repo}/git/matching-refs/tags/${encodeURIComponent(tag)}`],
        { cwd: root }
      )
    );
    const existing = refs.find((ref) => ref.ref === `refs/tags/${tag}`);
    if (existing) {
      assert.equal(
        existing.object.sha,
        plan.sha,
        `Tag points to another commit: ${tag}`
      );
    } else {
      runner(
        'gh',
        [
          'api',
          '--method',
          'POST',
          `${repo}/git/refs`,
          '-f',
          `ref=refs/tags/${tag}`,
          '-f',
          `sha=${plan.sha}`,
        ],
        { cwd: root }
      );
    }
    if (!releases.has(tag)) {
      runner(
        'gh',
        [
          'release',
          'create',
          tag,
          '--verify-tag',
          '--title',
          tag,
          '--notes',
          releaseNotes(root, pkg),
        ],
        { cwd: root, stdio: 'inherit' }
      );
    }
    console.log(`Released: ${tag}`);
  }
  return plan;
}

async function main() {
  const root = path.resolve(__dirname, '..');
  const [command, directory = '.release', ...extra] = process.argv.slice(2);
  assert.ok(
    ['prepare', 'verify', 'publish', 'verify-oidc'].includes(command) &&
      !extra.length,
    'Usage: node scripts/release.cjs <prepare|verify|publish|verify-oidc> [artifact-directory]'
  );
  const output = path.resolve(root, directory);
  assert.ok(
    Number(process.versions.node.split('.')[0]) > 22 ||
      (Number(process.versions.node.split('.')[0]) === 22 &&
        Number(process.versions.node.split('.')[1]) >= 14),
    'Node.js 22.14.0+ is required'
  );
  if (command === 'verify-oidc') return verifyOidc(root);
  const npm = run('npm', ['--version']).trim().split('.').map(Number);
  assert.ok(
    npm[0] > 11 ||
      (npm[0] === 11 && (npm[1] > 5 || (npm[1] === 5 && npm[2] >= 1))),
    'npm 11.5.1+ is required'
  );
  await { prepare, verify, publish }[command](root, output);
}

module.exports = { prepare, verify, publish, readRegistry, verifyOidc };
if (require.main === module)
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
