# react-native-nitro-device-info

> Get comprehensive device information for React Native using Nitro Modules

[![npm version](https://badge.fury.io/js/react-native-nitro-device-info.svg)](https://badge.fury.io/js/react-native-nitro-device-info)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A high-performance device information library for React Native, built on [Nitro Modules](https://nitro.margelo.com/) for zero-overhead native access through JSI.

## Features

- 🚀 **Zero-overhead JSI bindings** - Direct JavaScript-to-native communication
- ⚡️ **Synchronous access** - Instant access to cached device properties (<1ms)
- 🔄 **Asynchronous methods** - Promise-based I/O operations (<100ms)
- 📱 **50+ device properties** - Comprehensive device information
- 🎯 **80% API compatibility** - Drop-in replacement for common react-native-device-info use cases
- 📦 **TypeScript-first** - Full type definitions included
- 🌍 **Cross-platform** - iOS 13.4+ and Android API 21+ support

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

// Synchronous methods (immediate - <1ms)
const uniqueId = DeviceInfoModule.getUniqueId();
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.getManufacturer();
console.log(manufacturer); // "Apple"

const isTablet = DeviceInfoModule.isTablet();
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
const manufacturer = DeviceInfoModule.getManufacturer(); // "Apple"
const uniqueId = DeviceInfoModule.getUniqueId(); // "FCDBD8EF-..."

// Device Capabilities
const isTablet = DeviceInfoModule.isTablet(); // false
const hasNotch = DeviceInfoModule.hasNotch(); // true
const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland(); // false
const isCameraPresent = DeviceInfoModule.isCameraPresent(); // true
const isEmulator = DeviceInfoModule.isEmulator(); // false

// System Resources
const totalMemory = DeviceInfoModule.getTotalMemory();
const usedMemory = DeviceInfoModule.getUsedMemory();
const totalDisk = DeviceInfoModule.getTotalDiskCapacity();
const freeDisk = DeviceInfoModule.getFreeDiskStorage();

console.log(`RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`);
console.log(`Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB free of ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB`);

// Battery Information
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const isCharging = DeviceInfoModule.isBatteryCharging();
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(`Battery: ${(batteryLevel * 100).toFixed(0)}% ${isCharging ? '(charging)' : ''}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`);

// Application Metadata
const version = DeviceInfoModule.getVersion();
const buildNumber = DeviceInfoModule.getBuildNumber();
const bundleId = DeviceInfoModule.getBundleId();
const appName = DeviceInfoModule.getApplicationName();

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
const apiLevel = DeviceInfoModule.getApiLevel(); // Android: 33, iOS: -1
const abis = DeviceInfoModule.getSupportedAbis(); // ["arm64-v8a"]
const hasGms = DeviceInfoModule.hasGms(); // Android only
```

## API Reference

### Synchronous Properties

These properties return immediately with cached values:

| Property        | Type         | Description             | Example        |
| --------------- | ------------ | ----------------------- | -------------- |
| `deviceId`      | `string`     | Device model identifier | `"iPhone14,2"` |
| `brand`         | `string`     | Manufacturer name       | `"Apple"`      |
| `systemName`    | `string`     | Operating system name   | `"iOS"`        |
| `systemVersion` | `string`     | OS version string       | `"15.0"`       |
| `model`         | `string`     | Device model name       | `"iPhone"`     |
| `deviceType`    | `DeviceType` | Device category         | `"Handset"`    |

### Synchronous Methods

All methods below return immediately with cached values (<1ms):

#### Device Identification

| Method               | Returns    | Description                  |
| -------------------- | ---------- | ---------------------------- |
| `getUniqueId()`      | `string`   | Get persistent device ID     |
| `getManufacturer()`  | `string`   | Get manufacturer name        |

#### Device Capabilities

| Method                     | Returns    | Description                             |
| -------------------------- | ---------- | --------------------------------------- |
| `isTablet()`               | `boolean`  | Check if device is a tablet             |
| `hasNotch()`               | `boolean`  | Check for display notch (iOS only)      |
| `hasDynamicIsland()`       | `boolean`  | Check for Dynamic Island (iOS 16+)      |
| `isCameraPresent()`        | `boolean`  | Check camera availability               |
| `isPinOrFingerprintSet()`  | `boolean`  | Check biometric security status         |
| `isEmulator()`             | `boolean`  | Check if running in simulator/emulator  |

#### System Resources

| Method                   | Returns   | Description                       |
| ------------------------ | --------- | --------------------------------- |
| `getTotalMemory()`       | `number`  | Total RAM in bytes                |
| `getUsedMemory()`        | `number`  | Current app memory usage          |
| `getTotalDiskCapacity()` | `number`  | Total storage in bytes            |
| `getFreeDiskStorage()`   | `number`  | Available storage in bytes        |

#### Battery Information

| Method                | Returns       | Description                      |
| --------------------- | ------------- | -------------------------------- |
| `getBatteryLevel()`   | `number`      | Battery level (0.0 to 1.0)       |
| `getPowerState()`     | `PowerState`  | Comprehensive power information  |
| `isBatteryCharging()` | `boolean`     | Charging status                  |

#### Application Metadata

| Method                   | Returns   | Description                     |
| ------------------------ | --------- | ------------------------------- |
| `getVersion()`           | `string`  | App version string              |
| `getBuildNumber()`       | `string`  | Build number                    |
| `getBundleId()`          | `string`  | Bundle ID or package name       |
| `getApplicationName()`   | `string`  | App display name                |

#### Platform-Specific

| Method                | Returns      | Description                              |
| --------------------- | ------------ | ---------------------------------------- |
| `getApiLevel()`       | `number`     | Android API level (-1 on iOS)            |
| `getSupportedAbis()`  | `string[]`   | CPU architectures                        |
| `hasGms()`            | `boolean`    | Google Mobile Services (Android only)    |
| `hasHms()`            | `boolean`    | Huawei Mobile Services (Android only)    |

### Asynchronous Methods

All methods below return Promises and typically complete in 10-100ms:

#### Application Metadata

- `getFirstInstallTime(): Promise<number>` - Install timestamp (ms since epoch)
- `getLastUpdateTime(): Promise<number>` - Last update timestamp

#### Network & Connectivity

- `getIpAddress(): Promise<string>` - Device IP address
- `getMacAddress(): Promise<string>` - MAC address (deprecated on iOS 7+)
- `getCarrier(): Promise<string>` - Cellular carrier name
- `isLocationEnabled(): Promise<boolean>` - Location services status
- `isHeadphonesConnected(): Promise<boolean>` - Headphone connection status

## Type Definitions

### PowerState

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 to 1.0
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS only
}
```

### DeviceType

```typescript
type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';
```

### BatteryState

```typescript
type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';
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

// Most methods are now synchronous
const uniqueId = DeviceInfoModule.getUniqueId(); // Sync now!
const totalMemory = DeviceInfoModule.getTotalMemory(); // Sync now!
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // Sync now!
const isTablet = DeviceInfoModule.isTablet(); // Same as before

// Only network/connectivity remain async
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

## Platform Support

- **iOS**: 13.4+ (99%+ of devices)
- **Android**: API 21+ (Android 5.0 Lollipop, 99%+ of devices)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

### Code Quality

This project uses automated code quality tools:

- **TypeScript**: Type checking with `yarn typecheck`
- **Linting**: oxlint (default) or ESLint with `yarn lint` or `yarn lint:eslint`
- **Kotlin**: ktlint for Android code formatting

**Formatting Kotlin code** (before committing Android changes):

```sh
cd example/showcase/android  # or example/benchmark/android
./gradlew :react-native-nitro-device-info:ktlintFormat
```

> For detailed ktlint usage, see [ktlint Quick Start Guide](specs/002-cleanup-boilerplate-add-ktlint/quickstart.md)

## License

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
