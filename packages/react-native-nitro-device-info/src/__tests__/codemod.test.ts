/**
 * Codemod transform tests.
 *
 * Applies `rewrite-imports` to each `*.input.*` fixture and compares the result
 * with the matching `*.output.*` fixture, plus explicit call-site assertions.
 */

import fs from 'fs';
import path from 'path';
import jscodeshift from 'jscodeshift';
import type { API, FileInfo } from 'jscodeshift';
import transform, {
  SOURCE_MODULE,
  TARGET_MODULE,
} from '../codemod/rewrite-imports';

const FIXTURES_DIR = path.join(__dirname, '__testfixtures__');

function parserForFile(file: string): 'tsx' | 'babel' {
  return file.endsWith('.ts') || file.endsWith('.tsx') ? 'tsx' : 'babel';
}

function buildApi(parser: 'tsx' | 'babel'): API {
  const j = jscodeshift.withParser(parser);
  return {
    j,
    jscodeshift: j,
    stats: () => {},
    report: () => {},
  };
}

function applyToFixture(inputFile: string): string {
  const parser = parserForFile(inputFile);
  const source = fs.readFileSync(
    path.join(FIXTURES_DIR, inputFile),
    'utf8'
  );
  const fileInfo: FileInfo = { path: inputFile, source };
  const result = transform(fileInfo, buildApi(parser), {});
  // Transform returns `undefined` when nothing changed.
  return typeof result === 'string' ? result : source;
}

function readOutput(outputFile: string): string {
  return fs.readFileSync(path.join(FIXTURES_DIR, outputFile), 'utf8');
}

const cases: Array<{ name: string; input: string; output: string }> = [
  {
    name: 'default import',
    input: 'default-import.input.tsx',
    output: 'default-import.output.tsx',
  },
  {
    name: 'named import',
    input: 'named-import.input.tsx',
    output: 'named-import.output.tsx',
  },
  {
    name: 'namespace import',
    input: 'namespace-import.input.tsx',
    output: 'namespace-import.output.tsx',
  },
  {
    name: 'CommonJS require',
    input: 'require-cjs.input.js',
    output: 'require-cjs.output.js',
  },
  {
    name: 're-export',
    input: 'reexport.input.ts',
    output: 'reexport.output.ts',
  },
];

describe('codemod: rewrite-imports', () => {
  it('exposes the source/target module constants', () => {
    expect(SOURCE_MODULE).toBe('react-native-device-info');
    expect(TARGET_MODULE).toBe('react-native-nitro-device-info/compat');
  });

  describe.each(cases)('$name', ({ input, output }) => {
    it('rewrites the specifier to match the output fixture', () => {
      const transformed = applyToFixture(input).trim();
      const expected = readOutput(output).trim();
      expect(transformed).toBe(expected);
    });

    it('no longer references the old module', () => {
      const transformed = applyToFixture(input);
      expect(transformed).not.toContain("'react-native-device-info'");
      expect(transformed).toContain(TARGET_MODULE);
    });
  });

  it('leaves unrelated imports and requires untouched', () => {
    const transformed = applyToFixture('unrelated.input.ts');
    expect(transformed).toBe(readOutput('unrelated.output.ts'));
    expect(transformed).toContain("'another-package'");
    expect(transformed).toContain("require('react-native')");
  });

  it('does not modify call sites', () => {
    const transformed = applyToFixture('default-import.input.tsx');
    // The call expression `DeviceInfo.getDeviceName()` must be preserved.
    expect(transformed).toContain('DeviceInfo.getDeviceName()');
    expect(transformed).not.toContain('.deviceName');
  });
});
