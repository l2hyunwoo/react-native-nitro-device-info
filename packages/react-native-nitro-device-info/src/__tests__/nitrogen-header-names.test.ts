import { existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import fixture from './__testfixtures__/vision-camera-5.2.3-nitrogen-headers.json';

const generated = join(__dirname, '..', '..', 'nitrogen', 'generated');

function hppBasenames(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return hppBasenames(full);
    return name.endsWith('.hpp') ? [name] : [];
  });
}

// Xcode's project header map keys headers by basename, so under use_frameworks!
// a generated header sharing a name with another Nitro module's header shadows it.
test('generated header basenames do not clash with react-native-vision-camera', () => {
  if (!existsSync(generated)) throw new Error(`${generated} missing: run \`yarn prepare\` first`);
  const ours = [...hppBasenames(join(generated, 'shared', 'c++')), ...hppBasenames(join(generated, 'ios'))];
  const theirs = new Set(fixture.headers);
  expect(ours.filter((h) => theirs.has(h))).toEqual([]);
});
