import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [app, serial] = process.argv.slice(2);
if (
  process.argv.length !== 4 ||
  !['showcase', 'integrity-demo'].includes(app) ||
  !/^emulator-\d+$/.test(serial ?? '')
) {
  throw new Error(
    'Usage: node scripts/test-harness-android-reconnect.mjs <showcase|integrity-demo> <emulator-serial>'
  );
}

const adb = (...args) =>
  execFileSync('adb', ['-s', serial, ...args], {
    encoding: 'utf8',
    timeout: 15000,
  }).trim();
const emulatorName = adb('emu', 'avd', 'name').split(/\r?\n/)[0];
const appRoot = path.resolve(import.meta.dirname, '..', 'example', app);
process.chdir(appRoot);

const { default: config } = await import(
  pathToFileURL(path.join(appRoot, 'rn-harness.config.mjs'))
);
const runner = config.runners.find(({ name }) => name === 'android');
runner.config.device = { type: 'emulator', name: emulatorName };
config.resetEnvironmentBetweenTestFiles = true;
config.diagnostics = true;

let metroPort;
let injected = false;
config.plugins = [
  ...(config.plugins ?? []),
  {
    name: 'android-reverse-recovery-regression',
    hooks: {
      metro: {
        initialized({ port }) {
          metroPort = port;
        },
      },
      run: {
        started({ testFiles }) {
          if (testFiles.length < 2) {
            throw new Error('Port recovery requires at least two test files.');
          }
        },
        finished() {
          if (!injected) {
            throw new Error('The port recovery regression did not run.');
          }
        },
      },
      testFile: {
        finished({ status }) {
          if (injected || status !== 'passed') return;
          if (!Number.isInteger(metroPort)) {
            throw new Error('Harness did not report its Metro port.');
          }
          adb('reverse', '--remove', `tcp:${metroPort}`);
          injected = true;
          console.log(
            `Removed ${serial} Metro tunnel tcp:${metroPort} after the first test file.`
          );
        },
      },
    },
  },
];

const cli = path.join(
  appRoot,
  'node_modules/@react-native-harness/cli/dist/index.js'
);
process.argv = [process.execPath, cli, '--harnessRunner', 'android'];
await import(pathToFileURL(cli));
