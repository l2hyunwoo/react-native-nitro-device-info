# Introduction

`react-native-nitro-device-info` reads device information from Swift and Kotlin through [Nitro Modules](https://nitro.margelo.com/). It provides synchronous properties, synchronous methods, Promise-based methods, and React hooks.

## Start with your task

| Task | Read first |
| --- | --- |
| Install in a React Native app | [Getting Started](/guide/getting-started) |
| Install in an Expo app | [Expo Setup](/guide/expo-setup) |
| Read device information | [Quick Start](/guide/quick-start) |
| Update a component when device state changes | [React Hooks Guide](/guide/react-hooks) |
| Replace `react-native-device-info` | [Migration Guide](/api/migration) |
| Build for web or server rendering | [Web Support](/guide/web-support) |
| Find an exact signature or platform fallback | [API Reference](/api/) |
| Use documentation with an AI assistant | [MCP Integration](/guide/mcp-integration) |

## Choose an API entry point

The package has two API entry points. Their names and return types differ.

```typescript
// Native API: named singleton, properties, and methods.
import { DeviceInfoModule } from 'react-native-nitro-device-info';
const model = DeviceInfoModule.model;
const battery = DeviceInfoModule.getBatteryLevel();
```

```typescript
// Compatibility API: react-native-device-info-style functions.
import DeviceInfo from 'react-native-nitro-device-info/compat';

async function readBattery() {
  return await DeviceInfo.getBatteryLevel();
}
const model = DeviceInfo.getModel();
```

The compatibility layer targets `react-native-device-info` 15.x. Review its [placeholder values and behavior differences](/api/migration#compat-layer-caveats) before migrating.

## Platforms and return values

- **iOS**: The library's deployment target is 15.1+.
- **Android**: The library's minimum SDK is API 24 (Android 7.0).
- **Web**: A JavaScript fallback provides browser-derived values where available. Other APIs return placeholders; see [Web Support](/guide/web-support).

Your React Native and Nitro versions can impose higher platform requirements. Synchronous calls return directly and run on the calling thread. They do not guarantee a particular execution time.

Unsupported or unavailable values can be `"unknown"`, `-1`, `false`, or an empty collection. Check each API's contract before using a result.

## Device information and security

[Local integrity checks](/api/device-integrity) detect root or jailbreak indicators. They are bypassable and do not prove that a device is trustworthy.

For tokens that your backend verifies, use the separate, optional [`react-native-nitro-device-integrity` package](/api/device-attestation).

For the architecture and measurement guidance, read [Why Nitro Module](/guide/why-nitro-module).
