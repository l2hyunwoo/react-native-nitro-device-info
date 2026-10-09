const { cpSync, mkdirSync, rmSync, statSync } = require('node:fs');
const path = require('node:path');

const repo = path.resolve(__dirname, '../../..');
const data = path.resolve(__dirname, '../data');

rmSync(data, { recursive: true, force: true });
mkdirSync(data, { recursive: true });
for (const [source, destination] of [
  ['packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts', 'DeviceInfo.nitro.ts'],
  ['packages/react-native-nitro-device-integrity/src/DeviceIntegrity.nitro.ts', 'DeviceIntegrity.nitro.ts'],
  ['docs/docs', 'docs'],
  ['README.md', 'README.md'],
]) {
  cpSync(path.join(repo, source), path.join(data, destination), {
    recursive: true,
    filter: file => statSync(file).isDirectory() || /\.(mdx?|ts)$/.test(file),
  });
}
