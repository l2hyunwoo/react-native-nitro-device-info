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
- 🔄 **Familiar APIs** - Compatible with `react-native-device-info` and `expo-device` APIs

## Installation

```sh
# Using npm
npm install react-native-nitro-device-info react-native-nitro-modules

# Using yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# Using pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **Note**: `react-native-nitro-modules` ^0.31.0 is required as a peer dependency.

### iOS Setup

```sh
cd ios && pod install && cd ..
```

### Android Setup

No additional configuration needed! Gradle auto-linking handles everything.

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

If you're migrating from `react-native-device-info`, the API is 80% compatible:

### Before (react-native-device-info)

```typescript
import DeviceInfo from 'react-native-device-info';

// Everything was async or method-based
const deviceId = DeviceInfo.getDeviceId();
const brand = DeviceInfo.getBrand();
const uniqueId = await DeviceInfo.getUniqueId();
const totalMemory = await DeviceInfo.getTotalMemory();
const batteryLevel = await DeviceInfo.getBatteryLevel();
const isTablet = DeviceInfo.isTablet();
```

### After (react-native-nitro-device-info)

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Properties are now direct getters
const deviceId = DeviceInfoModule.deviceId; // Property, not method
const brand = DeviceInfoModule.brand; // Property, not method

// Most values are now synchronous properties or methods
const uniqueId = DeviceInfoModule.uniqueId; // Property, sync!
const totalMemory = DeviceInfoModule.totalMemory; // Property, sync!
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // Method, sync!
const isTablet = DeviceInfoModule.isTablet; // Property, sync!

// Only network/connectivity remain async methods
const ipAddress = await DeviceInfoModule.getIpAddress();
```

**Key Differences**:

- Uses Nitro HybridObject (JSI) instead of TurboModule for zero-overhead calls
- Core device properties are now direct property accessors (not methods)
- Most methods are synchronous for instant access (<1ms)
- Only I/O-bound operations (network, install times) remain async

## Example Apps

This repository includes two example applications to help you get started and test the library:

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

For more details, see:

- [Showcase App README](example/showcase/README.md)
- [Benchmark App README](example/benchmark/README.md)

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

| Tool | Purpose | Example Query |
|------|---------|---------------|
| `search_docs` | Natural language documentation search | "how to get device model" |
| `get_api` | Detailed info about a specific API | "show me getBatteryLevel" |
| `list_apis` | List APIs by category/platform/type | "list all network APIs" |

Then ask your AI: "How do I get the device's battery level with react-native-nitro-device-info?"

For complete MCP server documentation, see [packages/mcp-server/README.md](packages/mcp-server/README.md).

## Platform Support

- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

## License

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
