/**
 * jscodeshift transform: rewrite `react-native-device-info` import specifiers to
 * `react-native-nitro-device-info/compat`.
 *
 * Stage 1 — import-rewrite only. ES imports (default, named, namespace),
 * re-exports, and CommonJS `require(...)` are retargeted. Call sites
 * (e.g. `DeviceInfo.getModel()`) are intentionally left untouched.
 *
 * @module react-native-nitro-device-info/codemod
 */

import type {
  API,
  FileInfo,
  Options,
  Transform,
} from 'jscodeshift';

const SOURCE_MODULE = 'react-native-device-info';
const TARGET_MODULE = 'react-native-nitro-device-info/compat';

const transform: Transform = (
  file: FileInfo,
  api: API,
  _options: Options
): string | undefined => {
  const j = api.jscodeshift;
  const root = j(file.source);

  let rewritten = 0;

  // ES: import ... from 'react-native-device-info'
  root
    .find(j.ImportDeclaration, {
      source: { value: SOURCE_MODULE },
    })
    .forEach(path => {
      path.node.source = j.literal(TARGET_MODULE);
      rewritten += 1;
    });

  // ES: export ... from 'react-native-device-info'
  root
    .find(j.ExportNamedDeclaration, {
      source: { value: SOURCE_MODULE },
    })
    .forEach(path => {
      path.node.source = j.literal(TARGET_MODULE);
      rewritten += 1;
    });

  root
    .find(j.ExportAllDeclaration, {
      source: { value: SOURCE_MODULE },
    })
    .forEach(path => {
      path.node.source = j.literal(TARGET_MODULE);
      rewritten += 1;
    });

  // CJS: require('react-native-device-info')
  root
    .find(j.CallExpression, {
      callee: { type: 'Identifier', name: 'require' },
    })
    .forEach(path => {
      const [arg] = path.node.arguments;
      if (arg && arg.type === 'Literal' && arg.value === SOURCE_MODULE) {
        arg.value = TARGET_MODULE;
        rewritten += 1;
      } else if (
        arg &&
        arg.type === 'StringLiteral' &&
        arg.value === SOURCE_MODULE
      ) {
        arg.value = TARGET_MODULE;
        rewritten += 1;
      }
    });

  if (rewritten === 0) {
    return undefined;
  }

  // Surface the count to the CLI via stats() when available.
  if (typeof api.stats === 'function') {
    api.stats('specifiers', rewritten);
  }

  return root.toSource({ quote: 'single' });
};

export default transform;
export { SOURCE_MODULE, TARGET_MODULE };
