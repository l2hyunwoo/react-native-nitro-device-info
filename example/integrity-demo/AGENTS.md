<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-06-14 -->

# Integrity Demo Example App

## Purpose
Demonstration app for `react-native-nitro-device-integrity` (hardware-backed device attestation: Play Integrity + App Attest). It issues attestation tokens and shows them on screen; token verification is intentionally left to the developer's server.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies, scripts (android, ios, start, build, test:e2e) |
| `index.js` | App entry point (registers `src/App`) |
| `react-native.config.js` | Links the local `react-native-nitro-device-integrity` workspace package |
| `metro.config.js` | Metro bundler configuration with workspace support |
| `rn-harness.config.mjs` | E2E test harness configuration |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source: `App.tsx` (attestation flow UI), `components/ResultCard.tsx`, `utils/hash.ts` (self-contained SHA-256), `__tests__/` (e2e harness tests) |
| `android/` | Android native project (namespace `nitrodeviceintegrity.demo`) |
| `ios/` | iOS native project (`NitroDeviceIntegrityDemo`) |

## For AI Agents

### Working In This Directory
- Run `yarn android` / `yarn ios` to launch the app
- Run `yarn start` for Metro bundler
- After changing the integrity package `.nitro.ts` API, run `yarn nitrogen:integrity` from the repo root

## Dependencies

### Internal
- `react-native-nitro-device-integrity` (workspace:*)

### External
- react 19.2.3, react-native 0.84.0, react-native-nitro-modules ^0.35.0
- react-native-harness (e2e testing)

<!-- MANUAL: -->
