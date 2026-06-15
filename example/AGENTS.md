<!-- Parent: ../AGENTS.md -->
<!-- Generated: 2026-02-13 -->

# Example Apps

## Purpose
Container directory for React Native example applications demonstrating react-native-nitro-device-info library usage.

## Subdirectories

| Directory | Purpose |
|-----------|---------|
| `showcase/` | Main demo app displaying all 80+ device properties (see `showcase/AGENTS.md`) |
| `benchmark/` | Performance benchmark app for latency comparison (see `benchmark/AGENTS.md`) |

## For AI Agents

### Working In This Directory
- Each subdirectory is a complete React Native app with independent package.json
- All apps use workspace:* for library dependency (changes reflect immediately for TS)
- Native changes require rebuilding the app
- iOS apps require `pod install` in ios/ directory before first run

### Common Patterns
- Library import: `import { DeviceInfo } from 'react-native-nitro-device-info'`
- Hook usage: `import { useBatteryLevel } from 'react-native-nitro-device-info'`

## Dependencies

### Internal
- All apps depend on `react-native-nitro-device-info` (workspace:*)

### External
- react 19.2.3, react-native 0.85.3, react-native-nitro-modules ^0.35.9

<!-- MANUAL: -->
