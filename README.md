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

// Synchronous access (immediate - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"

// Asynchronous access (Promise-based - <100ms)
const uniqueId = await DeviceInfoModule.getUniqueId();
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const powerState = await DeviceInfoModule.getPowerState();
console.log(powerState);
// {
//   batteryLevel: 0.75,
//   batteryState: 'charging',
//   lowPowerMode: false
// }
```

### Advanced Usage

```typescript
import { createDeviceInfo } from 'react-native-nitro-device-info';
import type { DeviceInfo, PowerState } from 'react-native-nitro-device-info';

// Create a device info instance
const deviceInfo: DeviceInfo = createDeviceInfo();

// Device Identification
const deviceId = deviceInfo.deviceId;
const manufacturer = await deviceInfo.getManufacturer();

// Device Capabilities
const isTablet = deviceInfo.isTablet();
const hasNotch = deviceInfo.hasNotch();
const hasDynamicIsland = deviceInfo.hasDynamicIsland();

// System Resources
const totalMemory = await deviceInfo.getTotalMemory();
const freeStorage = await deviceInfo.getFreeDiskStorage();
console.log(`Memory: ${totalMemory / 1024 / 1024 / 1024} GB`);
console.log(`Free Storage: ${freeStorage / 1024 / 1024 / 1024} GB`);

// Battery Information
const batteryLevel = await deviceInfo.getBatteryLevel();
console.log(`Battery: ${(batteryLevel * 100).toFixed(0)}%`);

// Application Metadata
const version = await deviceInfo.getVersion();
const buildNumber = await deviceInfo.getBuildNumber();
const bundleId = await deviceInfo.getBundleId();
console.log(`${bundleId} v${version} (${buildNumber})`);
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

| Method               | Returns   | Description                        |
| -------------------- | --------- | ---------------------------------- |
| `isTablet()`         | `boolean` | Check if device is a tablet        |
| `hasNotch()`         | `boolean` | Check for display notch (iOS only) |
| `hasDynamicIsland()` | `boolean` | Check for Dynamic Island (iOS 16+) |

### Asynchronous Methods

#### Device Identification

- `getUniqueId(): Promise<string>` - Get persistent device ID
- `getManufacturer(): Promise<string>` - Get manufacturer name

#### System Resources

- `getTotalMemory(): Promise<number>` - Total RAM in bytes
- `getUsedMemory(): Promise<number>` - Current app memory usage
- `getTotalDiskCapacity(): Promise<number>` - Total storage in bytes
- `getFreeDiskStorage(): Promise<number>` - Available storage in bytes
- `getBatteryLevel(): Promise<number>` - Battery level (0.0 to 1.0)
- `getPowerState(): Promise<PowerState>` - Comprehensive power information
- `isBatteryCharging(): Promise<boolean>` - Charging status

#### Application Metadata

- `getVersion(): Promise<string>` - App version string
- `getBuildNumber(): Promise<string>` - Build number
- `getBundleId(): Promise<string>` - Bundle ID (iOS) or package name (Android)
- `getApplicationName(): Promise<string>` - App display name
- `getFirstInstallTime(): Promise<number>` - Install timestamp (ms since epoch)
- `getLastUpdateTime(): Promise<number>` - Last update timestamp

#### Network & Connectivity

- `getIpAddress(): Promise<string>` - Device IP address
- `getMacAddress(): Promise<string>` - MAC address (deprecated on iOS 7+)
- `getCarrier(): Promise<string>` - Cellular carrier name
- `isLocationEnabled(): Promise<boolean>` - Location services status
- `isHeadphonesConnected(): Promise<boolean>` - Headphone connection status

#### Device Capabilities

- `isCameraPresent(): Promise<boolean>` - Camera availability
- `isPinOrFingerprintSet(): Promise<boolean>` - Biometric security status
- `isEmulator(): Promise<boolean>` - Simulator/emulator detection

#### Platform-Specific

- `getApiLevel(): Promise<number>` - Android API level (-1 on iOS)
- `getSupportedAbis(): Promise<string[]>` - CPU architectures
- `hasGms(): Promise<boolean>` - Google Mobile Services (Android only)
- `hasHms(): Promise<boolean>` - Huawei Mobile Services (Android only)

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

const deviceId = DeviceInfo.getDeviceId();
const uniqueId = await DeviceInfo.getUniqueId();
const isTablet = DeviceInfo.isTablet();
```

### After (react-native-nitro-device-info)

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const deviceId = DeviceInfoModule.deviceId; // Now a sync property!
const uniqueId = await DeviceInfoModule.getUniqueId(); // Same async method
const isTablet = DeviceInfoModule.isTablet(); // Same method
```

**Key Differences**:

- Uses Nitro HybridObject instead of TurboModule
- Some properties are now synchronous getters (faster!)

## Example Apps

This repository includes two example applications to help you get started and test the library:

### Showcase App (`example/showcase/`)

A simple, single-screen app that displays comprehensive device information.

**Purpose**: Demonstrates the library's API and displays all available device properties.

**Running the showcase app**:

```bash
# From repository root
yarn showcase ios
# or
yarn showcase android

# Or from the showcase directory
cd example/showcase
yarn ios
# or
yarn android
```

**Metro Port**: 8081 (default)

### Benchmark App (`example/benchmark/`)

An independent performance testing application for benchmarking the Nitro module.

**Purpose**: Performance testing, stress testing, and comparison with alternative implementations.

**Running the benchmark app**:

```bash
# From repository root
yarn benchmark ios
# or
yarn benchmark android

# Or from the benchmark directory
cd example/benchmark
yarn ios
# or
yarn android
```

For more details, see:

- [Showcase App README](example/showcase/README.md)
- [Benchmark App README](example/benchmark/README.md)

## Platform Support

- **iOS**: 13.4+ (99%+ of devices)
- **Android**: API 21+ (Android 5.0 Lollipop, 99%+ of devices)

> **📖 For detailed ktlint usage**: See [ktlint Quick Start Guide](specs/002-cleanup-boilerplate-add-ktlint/quickstart.md)

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow and guidelines.

### Pre-commit workflow (recommended)

Before committing Kotlin code changes:

```sh
cd example/android
./gradlew :react-native-nitro-device-info:ktlintFormat
cd ../..
git add .
git commit -m "Your commit message"
```

## License

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
