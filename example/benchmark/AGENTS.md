<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# Benchmark Example App

## Purpose
Performance benchmark application measuring and comparing react-native-nitro-device-info API call latency against react-native-device-info.

## Key Files

| File | Description |
|------|-------------|
| `package.json` | Dependencies (includes react-native-device-info ^11.1.0 for comparison) |
| `index.js` | App entry point |
| `metro.config.js` | Metro bundler configuration with workspace support |

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `src/` | TypeScript source (App.tsx, benchmarks/, components/) |
| `android/` | Android native project |
| `ios/` | iOS native project |

## For AI Agents

### Working In This Directory
- Run `yarn android` / `yarn ios` to launch the app
- Benchmarks measure API call latency, throughput, memory overhead
- Compares react-native-nitro-device-info vs react-native-device-info

### Testing Requirements
- Validate benchmark accuracy: consistent results across runs
- Measure sync API calls and async listener performance
- Record memory usage before/after API calls
- Verify performance targets: <10ms registration, <500ms callback latency

### Common Patterns
- Benchmark loop: warmup → measure N iterations → calculate stats (mean, median, p95, p99)
- Timing: `performance.now()` for high-resolution timestamps
- Side-by-side comparison table for both libraries

## Dependencies

### Internal
- `react-native-nitro-device-info` (workspace:*)

### External
- react 19.1.0, react-native 0.82.1, react-native-nitro-modules ^0.31.2
- react-native-device-info ^11.1.0 (comparison library)

<!-- MANUAL: -->
