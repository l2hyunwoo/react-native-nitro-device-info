#!/usr/bin/env node
'use strict';

/**
 * CLI: `npx react-native-nitro-device-info migrate [path]`
 *
 * Stage 1 migration — rewrites `react-native-device-info` import specifiers to
 * `react-native-nitro-device-info/compat` across the target path. Call sites are
 * left untouched. Wraps the jscodeshift `rewrite-imports` transform.
 */

const path = require('path');
const fs = require('fs');
const { run: jscodeshift } = require('jscodeshift/src/Runner');

function printUsage() {
  console.log(
    [
      'Usage: npx react-native-nitro-device-info migrate [path] [--dry] [--extensions=js,jsx,ts,tsx]',
      '',
      'Rewrites `react-native-device-info` imports to',
      '`react-native-nitro-device-info/compat`. Call sites are not modified.',
      '',
      'Arguments:',
      '  path                 File or directory to migrate (default: current directory).',
      '',
      'Options:',
      '  --dry                Preview changes without writing files.',
      '  --extensions=LIST    Comma-separated file extensions (default: js,jsx,ts,tsx).',
      '  -h, --help           Show this help.',
    ].join('\n')
  );
}

function resolveTransformPath() {
  // Prefer the built JS output; fall back to the TS source (jscodeshift can
  // transpile TS transforms via its babel setup).
  const candidates = [
    path.resolve(__dirname, '../lib/module/codemod/rewrite-imports.js'),
    path.resolve(__dirname, '../lib/commonjs/codemod/rewrite-imports.js'),
    path.resolve(__dirname, '../src/codemod/rewrite-imports.ts'),
  ];
  return candidates.find(candidate => fs.existsSync(candidate));
}

const SOURCE_MODULE = 'react-native-device-info';
const IGNORED_DIRS = new Set(['node_modules', '.git', 'lib', 'build', 'dist']);

/** Count `'react-native-device-info'` / `"react-native-device-info"` module references. */
function countSpecifiers(target, extensions) {
  const pattern = new RegExp(
    `(['"])${SOURCE_MODULE.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\1`,
    'g'
  );
  const exts = new Set(extensions.map(ext => '.' + ext.replace(/^\./, '')));
  let total = 0;

  const visit = entry => {
    const stat = fs.statSync(entry);
    if (stat.isDirectory()) {
      if (IGNORED_DIRS.has(path.basename(entry))) {
        return;
      }
      for (const child of fs.readdirSync(entry)) {
        visit(path.join(entry, child));
      }
      return;
    }
    if (!exts.has(path.extname(entry))) {
      return;
    }
    const source = fs.readFileSync(entry, 'utf8');
    const matches = source.match(pattern);
    if (matches) {
      total += matches.length;
    }
  };

  visit(target);
  return total;
}

async function main() {
  const argv = process.argv.slice(2);

  // Drop the leading `migrate` subcommand if present.
  const args = argv[0] === 'migrate' ? argv.slice(1) : argv;

  if (args.includes('-h') || args.includes('--help')) {
    printUsage();
    return;
  }

  const dry = args.includes('--dry');
  const extensionsArg = args.find(arg => arg.startsWith('--extensions='));
  const extensions = extensionsArg
    ? extensionsArg.split('=')[1]
    : 'js,jsx,ts,tsx';

  const positional = args.filter(arg => !arg.startsWith('-'));
  const target = path.resolve(positional[0] || process.cwd());

  if (!fs.existsSync(target)) {
    console.error(`Error: path does not exist: ${target}`);
    process.exitCode = 1;
    return;
  }

  const transformPath = resolveTransformPath();
  if (!transformPath) {
    console.error(
      'Error: could not locate the rewrite-imports transform. Reinstall react-native-nitro-device-info.'
    );
    process.exitCode = 1;
    return;
  }

  console.log(
    `Rewriting react-native-device-info imports under: ${target}${dry ? ' (dry run)' : ''}`
  );

  // Count source-module references up front: this equals the number of
  // specifiers the transform will rewrite, and is reliable regardless of how
  // jscodeshift aggregates its own worker stats.
  const specifiers = countSpecifiers(target, extensions.split(','));

  const result = await jscodeshift(transformPath, [target], {
    dry,
    silent: true,
    extensions,
    parser: 'tsx',
    babel: true,
    verbose: 0,
    ignorePattern: ['**/node_modules/**', '**/lib/**', '**/build/**'],
  });

  console.log('');
  console.log('Migration summary');
  console.log('-----------------');
  console.log(`  Files changed:        ${result.ok}`);
  console.log(`  Specifiers rewritten: ${specifiers}`);
  console.log(`  Files unchanged:      ${result.nochange}`);
  if (result.error) {
    console.log(`  Files with errors:    ${result.error}`);
  }
  console.log('');
  console.log('Next steps:');
  console.log(
    '  1. Remove the old dependency:  npm uninstall react-native-device-info'
  );
  console.log(
    '  2. Review documented caveats (stubs and async-only sync variants) in the'
  );
  console.log(
    '     migration guide before shipping: getInstanceId / getInstanceIdSync,'
  );
  console.log(
    '     getAppSetId, getUserAgentSync, getInstallReferrerSync.'
  );

  if (result.error) {
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(err);
  process.exitCode = 1;
});
