# react-native-nitro-device-info

> Get comprehensive device information for React Native using Nitro Modules

<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/v/react-native-nitro-device-info.svg?style=flat-square" alt="npm version"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dm/react-native-nitro-device-info.svg?style=flat-square" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dt/react-native-nitro-device-info.svg?style=flat-square" alt="npm total downloads"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>

📖 **[Read the full documentation](https://l2hyunwoo.github.io/react-native-nitro-device-info/)**

A high-performance device information library for React Native, built on [Nitro Modules](https://nitro.margelo.com/) for zero-overhead native access through JSI.

## Features

- 🚀 **Zero-overhead JSI bindings** - Direct JavaScript-to-native communication
- 📱 **100+ device properties** - Comprehensive device information
- 📦 **TypeScript-first** - Full type definitions included
- 🔄 **Drop-in compatible** - Bundled compat layer + codemod for `react-native-device-info`; familiar `expo-device` APIs too

## Installation

```sh
# Using npm
npm install react-native-nitro-device-info react-native-nitro-modules

# Using yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# Using pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` >=0.35.0 <1.0.0 is required as a peer dependency.

### iOS Setup

```sh
cd ios && pod install && cd ..
```

### Android Setup

No additional configuration needed! Gradle auto-linking handles everything.

### Expo (prebuild / dev client)

```sh
npx expo install react-native-nitro-device-info react-native-nitro-modules
```

Autolinking is enough for most APIs. A few APIs that need a permission or entitlement are opt-in via a config plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["react-native-nitro-device-info", { "enableSerialNumber": true }]
    ]
  }
}
```

Then run `npx expo prebuild --clean`. See the [Expo Setup guide](https://l2hyunwoo.github.io/react-native-nitro-device-info/guide/expo-setup) for all options, the device-integrity plugin, and the `isSideLoadingEnabled()` caveat.

## Quick Start

### Basic Usage

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Synchronous properties (immediate - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"
console.log(DeviceInfoModule.model); // "iPhone"

// Synchronous properties (immediate - <1ms)
const uniqueId = DeviceInfoModule.uniqueId;
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.manufacturer;
console.log(manufacturer); // "Apple"

const isTablet = DeviceInfoModule.isTablet;
console.log(isTablet); // false

const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`Battery: ${(batteryLevel * 100).toFixed(0)}%`); // "Battery: 85%"

// Asynchronous methods (Promise-based - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"

const carrier = await DeviceInfoModule.getCarrier();
console.log(carrier); // "T-Mobile"
```

### Advanced Usage

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, DeviceType } from 'react-native-nitro-device-info';

// Device Identification
const deviceId = DeviceInfoModule.deviceId; // "iPhone14,2"
const manufacturer = DeviceInfoModule.manufacturer; // "Apple"
const uniqueId = DeviceInfoModule.uniqueId; // "FCDBD8EF-..."

// Device Capabilities
const isTablet = DeviceInfoModule.isTablet; // false
const hasNotch = DeviceInfoModule.getHasNotch(); // true
const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland(); // false
const isCameraPresent = DeviceInfoModule.isCameraPresent; // true
const isEmulator = DeviceInfoModule.isEmulator; // false
const deviceYearClass = DeviceInfoModule.deviceYearClass; // 2021 (estimated year class)

// System Resources
const totalMemory = DeviceInfoModule.totalMemory;
const usedMemory = DeviceInfoModule.getUsedMemory();
const totalDisk = DeviceInfoModule.totalDiskCapacity;
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
const uptime = DeviceInfoModule.getUptime(); // Uptime in milliseconds

console.log(
  `RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`
);
console.log(
  `Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB free of ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB`
);
console.log(
  `Uptime: ${Math.floor(uptime / 1000 / 60 / 60)}h ${Math.floor((uptime / 1000 / 60) % 60)}m`
);

// Battery Information
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const isCharging = DeviceInfoModule.getIsBatteryCharging();
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(
  `Battery: ${(batteryLevel * 100).toFixed(0)}% ${isCharging ? '(charging)' : ''}`
);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`);

// Application Metadata
const version = DeviceInfoModule.version;
const buildNumber = DeviceInfoModule.buildNumber;
const bundleId = DeviceInfoModule.bundleId;
const appName = DeviceInfoModule.applicationName;

console.log(`${appName} (${bundleId})`);
console.log(`Version: ${version} (${buildNumber})`);

// Network & Connectivity (Async)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();

console.log(`IP: ${ipAddress}`);
console.log(`Carrier: ${carrier}`);
console.log(`Location Services: ${isLocationEnabled ? 'enabled' : 'disabled'}`);

// Platform-Specific
const apiLevel = DeviceInfoModule.apiLevel; // Android: 33, iOS: -1
const abis = DeviceInfoModule.supportedAbis; // ["arm64-v8a"]
const hasGms = DeviceInfoModule.getHasGms(); // Android only
const canSideload = DeviceInfoModule.isSideLoadingEnabled(); // Android only

// Device Integrity (Root/Jailbreak Detection) - Local detection only
const isCompromised = DeviceInfoModule.isDeviceCompromised(); // Sync, <50ms
const isCompromisedAsync = await DeviceInfoModule.verifyDeviceIntegrity(); // Async
```

> **Need server-verifiable attestation?** The local checks above are bypassable.
> For hardware-backed, server-verified attestation (Play Integrity on Android,
> App Attest / DeviceCheck on iOS), use the opt-in
> [`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity)
> package. It issues tokens your backend verifies — see its
> [README](packages/react-native-nitro-device-integrity/README.md).

## API Reference

For complete API documentation with all 100+ methods and properties, see **[API-REFERENCE.md](API-REFERENCE.md)**.

### Quick Reference

#### Core Properties (Synchronous - <1ms)

```typescript
DeviceInfoModule.deviceId; // "iPhone14,2"
DeviceInfoModule.brand; // "Apple"
DeviceInfoModule.systemVersion; // "15.0"
DeviceInfoModule.model; // "iPhone"
```

#### Common Properties

```typescript
// Device Info
DeviceInfoModule.uniqueId; // Sync
DeviceInfoModule.isTablet; // Sync
DeviceInfoModule.totalMemory; // Sync
DeviceInfoModule.getBatteryLevel(); // Sync method
DeviceInfoModule.deviceYearClass; // Sync - estimated device year class
DeviceInfoModule.getUptime(); // Sync - uptime in milliseconds

// App Info
DeviceInfoModule.version; // Sync
DeviceInfoModule.bundleId; // Sync

// Platform (Android)
DeviceInfoModule.isSideLoadingEnabled(); // Sync - check sideloading permission

// Network (Async methods)
await DeviceInfoModule.getIpAddress(); // ~20-50ms
await DeviceInfoModule.getCarrier(); // ~20-50ms
```

For the complete list of all methods, properties, and detailed documentation, see **[API-REFERENCE.md](API-REFERENCE.md)**.

## Type Definitions

The library includes full TypeScript definitions. For complete type documentation, see [API-REFERENCE.md](API-REFERENCE.md#type-definitions).

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';
```

## Migration from react-native-device-info

`react-native-nitro-device-info` is a **drop-in replacement** for `react-native-device-info` (RNDI).
A bundled compatibility layer exposes RNDI's exact API surface — same function names, signatures,
default `DeviceInfo` object, and hooks — so you migrate by rewriting imports only. **Your call sites
stay unchanged.**

```bash
# 1. Install
npm install react-native-nitro-device-info react-native-nitro-modules
cd ios && pod install && cd ..

# 2. Rewrite imports automatically (call sites untouched)
npx react-native-nitro-device-info migrate

# 3. Remove the old dependency
npm uninstall react-native-device-info
```

The codemod rewrites every `react-native-device-info` import to
`react-native-nitro-device-info/compat`:

```typescript
// Before
import DeviceInfo from 'react-native-device-info';
import { getModel, useBatteryLevel } from 'react-native-device-info';

// After (rewritten for you — usage is identical)
import DeviceInfo from 'react-native-nitro-device-info/compat';
import { getModel, useBatteryLevel } from 'react-native-nitro-device-info/compat';
```

The compat layer covers the entire RNDI surface; a handful of deprecated/unavailable APIs return
documented placeholder values. Want maximum performance? The native API (`DeviceInfoModule`) offers
direct property access and synchronous getters. See the
[Migration Guide](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/migration) for the
full mapping, caveats, and the optional native-API path.

## Acknowledgement

- [This Week in React #256](https://thisweekinreact.com/newsletter/256#react-native)
- [NativeWeekly - React Native dev briefing](https://nativeweekly.beehiiv.com/)
  - [October 31 2025: Issue 3](https://nativeweekly.beehiiv.com/p/october-31-2025-issue-3)
  - [Nov 14 2025: Issue 5](https://nativeweekly.beehiiv.com/p/nov-14-2025-issue-5)
- [The React Native Rewind](https://thereactnativerewind.com/)
  - [A Nitro Revolution, Building Games in React Native, and a New Era of Navigation](https://thereactnativerewind.com/issues-blog-post/a-nitro-revolution-building-games-in-react-native-and-a-new-era-of-navigation)

## Example Apps

This repository includes three example applications to help you get started and test the library:

### Showcase App (`example/showcase/`)

A simple, single-screen app that displays comprehensive device information.

**Purpose**: Demonstrates the library's API and displays all available device properties.

**Running the showcase app**:

```bash
# From repository root
yarn showcase start  # Start Metro bundler
yarn showcase ios    # Run on iOS
yarn showcase android # Run on Android

# Or from the showcase directory
cd example/showcase
yarn start           # Start Metro bundler
yarn ios             # Run on iOS
yarn android         # Run on Android
```

### Benchmark App (`example/benchmark/`)

An independent performance testing application for benchmarking the Nitro module.

**Purpose**: Performance testing, stress testing, and comparison with alternative implementations.

**Running the benchmark app**:

```bash
# From repository root
yarn benchmark start  # Start Metro bundler
yarn benchmark ios    # Run on iOS
yarn benchmark android # Run on Android

# Or from the benchmark directory
cd example/benchmark
yarn start            # Start Metro bundler
yarn ios              # Run on iOS
yarn android          # Run on Android
```

### Integrity Demo App (`example/integrity-demo/`)

A demo for the opt-in
[`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity)
package. It **issues** attestation tokens (Play Integrity / App Attest /
DeviceCheck) and shows them on screen — verification is left to your server, by
design.

**Running the integrity demo app**:

```bash
# From repository root
yarn integrity-demo start   # Start Metro bundler
yarn integrity-demo ios     # Run on iOS (real device required for App Attest)
yarn integrity-demo android # Run on Android (needs Google Play Services)
```

For more details, see:

- [Showcase App README](example/showcase/README.md)
- [Benchmark App README](example/benchmark/README.md)
- [Integrity Demo App README](example/integrity-demo/README.md)

## MCP Server for AI Integration

Enable AI tools like Claude, Cursor, and Copilot to access accurate library documentation through the MCP (Model Context Protocol) server.

### Quick Setup (Recommended)

Run the `init` command in your React Native project to automatically configure MCP for Cursor and Claude Code:

```bash
cd your-react-native-project
npx @react-native-nitro-device-info/mcp-server init
```

This creates:

- `.cursor/mcp.json` - Cursor IDE configuration
- `.mcp.json` - Claude Code project configuration

Then restart your IDE and start asking questions!

### Manual Configuration

#### Claude Desktop

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

After saving, restart Claude Desktop completely (Cmd+Q, then reopen).

#### Cursor IDE

Create `.cursor/mcp.json` in your project root:

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

### Available Tools

| Tool          | Purpose                               | Example Query             |
| ------------- | ------------------------------------- | ------------------------- |
| `search_docs` | Natural language documentation search | "how to get device model" |
| `get_api`     | Detailed info about a specific API    | "show me getBatteryLevel" |
| `list_apis`   | List APIs by category/platform/type   | "list all network APIs"   |

Then ask your AI: "How do I get the device's battery level with react-native-nitro-device-info?"

For complete MCP server documentation, see [packages/mcp-server/README.md](packages/mcp-server/README.md).

## Platform Support

- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)
- **Web**: import-safe fallback (see below)

## Web support

Nitro is a JSI/native technology, so there is no native module in a browser. To
keep apps that target both native and web (react-native-web, Next.js SSR)
buildable, this package ships a pure-JS web fallback that is selected
automatically by your bundler — there is no separate package to install and no
import path to change.

```ts
// Same import on every platform.
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// On web this returns a fallback value instead of throwing.
console.log(DeviceInfoModule.systemLanguage); // e.g. "en-US" from navigator.language
console.log(DeviceInfoModule.deviceId);       // "unknown" — not available in a browser
```

The fallback's goal is **"does not crash, and returns honest values"** — not "does
everything." Where a browser API can answer, it does; everything else returns the
same neutral constants the native side uses for an unsupported platform
(`"unknown"` / `-1` / `false` / `[]`). Values are never fabricated to look real.

**Derived from a real browser API (when available, otherwise the fallback):**

| Member | Source |
| --- | --- |
| `systemName` | parsed from `navigator.userAgent` (`"Windows"`/`"macOS"`/`"iOS"`/`"Android"`/`"Linux"`, else `"web"`) |
| `systemLanguage` | `navigator.language` |
| `brand`, `manufacturer` | `navigator.vendor` |
| `totalMemory` | `navigator.deviceMemory` × 1024³ (coarse, spec-bucketed; `-1` if unsupported) |
| `getIsLandscape()` | `screen.width > screen.height` |
| `getUserAgent()` | `navigator.userAgent` |
| `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | Battery Status API (`navigator.getBattery()`), read once and cached; `-1`/`unknown` if the API is absent or denied |
| `getIsAirplaneMode()` | inferred from `navigator.onLine` (best effort) |

**Always a fallback constant on web:** all Android `Build.*` fields, carrier/MNC/MCC
info, disk/used-memory figures, headphone/location/notch checks, integrity checks
(`isDeviceCompromised()` → `false`), app metadata (`version`/`bundleId`/…), and the
Windows-only fields. Promise-returning methods keep their signature and **resolve**
the fallback (they do not reject), except `getDeviceToken()` which rejects on web —
it is Apple DeviceCheck, with no web equivalent, mirroring its behavior on Android.

**SSR:** every browser global is accessed defensively, so importing the package and
reading any member on a server (where `navigator`/`screen`/`window` may be absent)
never throws.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

## License

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
