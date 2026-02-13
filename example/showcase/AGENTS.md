<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# Showcase Example App

## Purpose
Primary demonstration app displaying all 80+ device information properties. Used in CI workflows for iOS and Android build validation. Includes e2e test suite.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies, scripts (android, ios, start, build, test:e2e) |
| `index.js` | App entry point |
| `metro.config.js` | Metro bundler configuration with workspace support |
| `rn-harness.config.mjs` | E2E test harness configuration |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source (App.tsx, screens/, components/) |
| `android/` | Android native project |
| `ios/` | iOS native project |
| `__tests__/` | E2E tests (core-properties, dynamic-state, edge-cases, hooks, platform-specific) |

## For AI Agents

### Working In This Directory
- Run `yarn android` / `yarn ios` to launch the app
- Run `yarn start` for Metro bundler
- Run `yarn test:e2e` to run end-to-end tests
- All new features must be demonstrated in this app (per project checklist)

### Testing Requirements
- E2E tests via react-native-harness in `__tests__/`
- CI runs build:android and build:ios via GitHub Actions
- Verify all 80+ properties render without crashes
- Test both sync getters and async methods

### Common Patterns
- API access: `DeviceInfo.getBrand()`, `DeviceInfo.getModel()`
- Hook usage: `const batteryLevel = useBatteryLevel()`
- Platform-specific rendering: `Platform.select({ ios: ..., android: ... })`

## Dependencies

### Internal
- `react-native-nitro-device-info` (workspace:*)

### External
- react 19.1.0, react-native 0.82.1, react-native-nitro-modules ^0.31.2
- react-native-harness (e2e testing)

<!-- MANUAL: -->
