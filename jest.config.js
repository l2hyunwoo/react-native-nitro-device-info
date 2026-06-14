/** @type {import('jest').Config} */
module.exports = {
  // Delegate to each workspace's own jest config so their babel/preset/module
  // settings stay isolated. A single root config can't serve all of them: the
  // device-info package transforms react-native's Flow via @react-native/babel-preset,
  // while mcp-server uses ts-jest in a node env — mixing them breaks one or the other.
  //
  // Only workspaces with runnable (non-device) jest suites are listed. Excluded:
  //   - example/showcase, example/integrity-demo: react-native-harness preset,
  //     *.harness.* suites need a connected device/runner — not runnable here.
  //   - react-native-nitro-device-integrity, example/benchmark: no jest suites.
  projects: [
    '<rootDir>/packages/react-native-nitro-device-info',
    '<rootDir>/packages/mcp-server',
  ],
};
