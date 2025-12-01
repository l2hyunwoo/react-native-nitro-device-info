# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.4.1] - 2025-12-02

### Fixed

- **iOS**: `getIpAddress()` and `getIpAddressSync()` now consistently return IPv4 addresses when available ([#39](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues/39))
  - Previously, the functions could return IPv6 addresses inconsistently due to network interface enumeration order
  - IPv4 addresses are now prioritized, with IPv6 used only as a fallback when no IPv4 is available

- **Android**: `getHasGms()` no longer crashes when `play-services-base` dependency is not included ([#40](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues/40))
  - Previously, calling `getHasGms()` without the GMS dependency would throw a JNI exception (`NoClassDefFoundError`)
  - The function now catches `NoClassDefFoundError` explicitly (not `Throwable`) to avoid masking serious JVM errors
  - This allows apps distributed on non-GMS stores (Amazon, Huawei AppGallery) to safely use this API

## [1.4.0] - 2025-12-01

### Added

- **React Hooks for Device State Monitoring** ([#38](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/38)): 7 new React hooks for reactive device state monitoring

  **Battery & Power** (3 hooks):
  - `useBatteryLevel()`: Real-time battery level monitoring (0.0-1.0), polls every 5s
  - `useBatteryLevelIsLow()`: Low battery detection with platform-specific thresholds (iOS: 20%, Android: 15%)
  - `usePowerState()`: Comprehensive power state object with level, charging state, and low power mode

  **Audio Output** (3 hooks):
  - `useIsHeadphonesConnected()`: Any headphone connection monitoring, polls every 1s
  - `useIsWiredHeadphonesConnected()`: Wired headphone detection, polls every 1s
  - `useIsBluetoothHeadphonesConnected()`: Bluetooth audio device detection, polls every 1s

  **Display** (1 hook):
  - `useBrightness()`: Screen brightness monitoring (iOS only, returns -1 on Android), polls every 500ms

- **Example App Enhancements**:
  - Showcase app: Added HooksDemo screen with tab navigation for interactive hook demonstrations
  - Benchmark app: Added React hooks performance benchmarks (registration time, cleanup validation, callback latency)

- **Documentation**:
  - New hooks API reference (`docs/api/hooks.md`) with complete signatures and platform support tables
  - New React hooks usage guide (`docs/guide/react-hooks.md`) with 5+ examples
  - Updated migration guide with hooks comparison table

**Usage Example**:

```typescript
import { useBatteryLevel, useIsHeadphonesConnected } from 'react-native-nitro-device-info';

function BatteryStatus() {
  const batteryLevel = useBatteryLevel();
  const isHeadphonesConnected = useIsHeadphonesConnected();

  return (
    <View>
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
      <Text>Headphones: {isHeadphonesConnected ? 'Connected' : 'Disconnected'}</Text>
    </View>
  );
}
```

## [1.3.1] - 2025-12-01

### Fixed

- **Dynamic Island Detection**: Fixed `getHasDynamicIsland()` returning `false` on iPhone 15/16/17 series and iPhone Air ([#36](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues/36))
  - Replaced hardcoded device model list with safe area inset detection (>= 51pt threshold)
  - Now automatically supports all current and future Dynamic Island devices
  - Works correctly with Display Zoom accessibility settings
  - No library updates needed for new iPhone models

## [1.3.0] - 2025-11-29

### Added

- **System Language & Navigation Mode API**: New localization and navigation detection capabilities
  - `systemLanguage`: Get device system language in BCP 47 format (e.g., "en-US", "ko-KR")
  - `navigationMode`: Detect Android navigation mode (`'gesture' | 'buttons' | 'twobuttons' | 'unknown'`)
  - `NavigationMode` type: New TypeScript type for navigation mode values

- **Complete API Migration**: All APIs from `react-native-device-info` have been migrated
  - Full feature parity with the original library
  - All device information methods now available through Nitro Modules
  - Enhanced performance with synchronous API design where applicable
  - Maintained backward-compatible method signatures for easy migration

- **Documentation Site**: Comprehensive documentation site built with RSPress
  - English and Korean language support
  - Complete API reference with TypeScript definitions
  - Usage examples and migration guide from `react-native-device-info`
  - Automated CI/CD deployment to GitHub Pages
  - Visit at: https://l2hyunwoo.github.io/react-native-nitro-device-info/

### Changed

#### BREAKING: Runtime-Mutable Properties Converted to Methods (18 APIs)

Properties that return values which can change during app runtime have been converted from readonly properties to synchronous getter methods. This provides clearer semantics - methods indicate "query on each call" while properties implied cached/stable values.

**Battery & Power** (3 APIs):

- `batteryLevel` → `getBatteryLevel()`: Returns current battery level (0.0-1.0)
- `powerState` → `getPowerState()`: Returns PowerState object
- `isBatteryCharging` → `getIsBatteryCharging()`: Returns charging status

**System Resources** (3 APIs):

- `usedMemory` → `getUsedMemory()`: Returns current app memory usage
- `freeDiskStorage` → `getFreeDiskStorage()`: Returns free disk space
- `freeDiskStorageOld` → `getFreeDiskStorageOld()`: Returns free disk space (legacy API)

**Audio/Peripherals** (3 APIs):

- `isWiredHeadphonesConnected` → `getIsWiredHeadphonesConnected()`: Wired headphone detection
- `isBluetoothHeadphonesConnected` → `getIsBluetoothHeadphonesConnected()`: Bluetooth headphone detection
- `isHeadphonesConnectedSync` → `getIsHeadphonesConnected()`: Any headphone detection

**Network & Connectivity** (6 APIs):

- `isAirplaneMode` → `getIsAirplaneMode()`: Airplane mode status (Android only)
- `ipAddressSync` → `getIpAddressSync()`: Current IP address (cached 5s)
- `carrierSync` → `getCarrierSync()`: Carrier name (cached 5s)
- `isLocationEnabledSync` → `getIsLocationEnabled()`: Location services status
- `macAddressSync` → `getMacAddressSync()`: MAC address (cached 5s)
- `availableLocationProviders` → `getAvailableLocationProviders()`: Enabled location providers

**Display & Orientation** (3 APIs):

- `isLandscape` → `getIsLandscape()`: Device orientation
- `fontScale` → `getFontScale()`: System font scale multiplier
- `brightness` → `getBrightness()`: Screen brightness (iOS only)

**Platform Detection** (4 APIs):

- `hasNotch` → `getHasNotch()`: Check if device has a display notch (iOS only)
- `hasDynamicIsland` → `getHasDynamicIsland()`: Check if device has Dynamic Island (iOS only)
- `hasGms` → `getHasGms()`: Check if Google Mobile Services is available (Android only)
- `hasHms` → `getHasHms()`: Check if Huawei Mobile Services is available (Android only)

**Migration Example**:

```typescript
// Before (v1.2.1)
const level = DeviceInfoModule.batteryLevel;
const charging = DeviceInfoModule.isBatteryCharging;

// After (v1.3.0)
const level = DeviceInfoModule.getBatteryLevel();
const charging = DeviceInfoModule.getIsBatteryCharging();
```

## [1.2.1] - 2025-11-04

### Added

- **Hardware Security**: `isHardwareKeyStoreAvailable` property to check hardware-backed keystore availability ([#25](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/25))
  - iOS: Returns `true` if Secure Enclave is available
  - Android: Returns `true` if hardware-backed KeyStore is available

- **iOS 26 Liquid Glass**: `supportsLiquidGlass` property to detect iOS 26+ Liquid Glass UI support ([#24](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/24))
  - Returns `true` on iOS 26+ devices, `false` on Android and older iOS versions

## [1.2.0] - 2025-10-28

### Changed

#### API Design: Functions Converted to Properties

All getter functions have been converted to readonly properties for cleaner, more intuitive access ([#20](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/20)):

**Before (v1.1.x)**:

```typescript
const brand = DeviceInfoModule.getBrand();
const model = DeviceInfoModule.getModel();
const isTablet = DeviceInfoModule.isTablet();
```

**After (v1.2.0)**:

```typescript
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const isTablet = DeviceInfoModule.isTablet;
```

This change affects all static device information properties that don't change during runtime.

## [1.1.2] - 2025-10-27

### Changed

- **Documentation**: Updated documentation with new logo and improved styling ([#17](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/17))
- **Documentation**: Simplified documentation structure without i18n ([#16](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/16))

### Fixed

- **CI/CD**: Fixed docs deployment script ([#15](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/15))

## [1.1.1] - 2025-10-26

### Changed

- **Example Apps**: Enhanced showcase and benchmark apps with improved UI and functionality ([#14](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/14))
  - Showcase: Reorganized property display with category sections and platform badges
  - Benchmark: Added comparison charts, statistics panels, and performance multiplier displays

## [1.1.0] - 2025-10-26

### Added

- **Additional APIs**: Added remaining APIs from `react-native-device-info` for full feature parity ([#11](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/11))
  - Network: `getIpAddress()`, `getMacAddress()`, `getCarrier()`
  - Storage: `getTotalDiskCapacity()`, `getFreeDiskStorage()`, `getFreeDiskStorageOld()`
  - Memory: `getTotalMemory()`, `getUsedMemory()`, `getMaxMemory()`
  - Device: `getDeviceName()`, `getUserAgent()`, `getInstanceId()`, `getInstallReferrer()`
  - Location: `isLocationEnabled()`, `getAvailableLocationProviders()`
  - Audio: `isHeadphonesConnected()`, `isWiredHeadphonesConnected()`, `isBluetoothHeadphonesConnected()`
  - Display: `getFontScale()`, `getBrightness()`, `isLandscape()`
  - Security: `isPinOrFingerprintSet()`, `isEmulator()`
  - Platform-specific: `getApiLevel()`, `getPreviewSdkInt()`, `getSecurityPatch()`, `getCodename()`

- **Documentation Site**: Added RSPress-based documentation site with comprehensive API reference ([#12](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/12))

## [1.0.0] - 2025-10-25

### Added

- **First Stable Release**: Finalized synchronous API design for instant device information access
- Comprehensive performance benchmarking in example apps validating <1ms execution time
- Dedicated battery monitoring section in showcase app demonstrating real-time synchronous updates
- TypeScript type safety with synchronous return types (no Promise wrappers)

### Changed

#### Synchronous API Refactoring (18 Methods)

All methods listed below have been converted from Promise-based to synchronous for instant access (<1ms):

**Device Identification** (2 methods):

- `getUniqueId()`: `Promise<string>` → `string`
  - Returns device-unique ID (iOS: IDFV, Android: ANDROID_ID)
  - **Before**: `const id = await deviceInfo.getUniqueId()`
  - **After**: `const id = deviceInfo.getUniqueId()`

- `getManufacturer()`: `Promise<string>` → `string`
  - Returns manufacturer name ("Apple", "Samsung", etc.)
  - **Before**: `const manufacturer = await deviceInfo.getManufacturer()`
  - **After**: `const manufacturer = deviceInfo.getManufacturer()`

**Battery & Power** (3 methods):

- `getBatteryLevel()`: `Promise<number>` → `number`
  - Returns battery level (0.0 to 1.0)
  - **Before**: `const level = await deviceInfo.getBatteryLevel()`
  - **After**: `const level = deviceInfo.getBatteryLevel()`

- `isBatteryCharging()`: `Promise<boolean>` → `boolean`
  - Returns charging state
  - **Before**: `const charging = await deviceInfo.isBatteryCharging()`
  - **After**: `const charging = deviceInfo.isBatteryCharging()`

- `getPowerState()`: `Promise<PowerState>` → `PowerState`
  - Returns comprehensive battery state (level, state, lowPowerMode)
  - **Before**: `const state = await deviceInfo.getPowerState()`
  - **After**: `const state = deviceInfo.getPowerState()`

**Application Metadata** (4 methods):

- `getVersion()`: `Promise<string>` → `string`
  - Returns app version (e.g., "1.0.0")
  - **Before**: `const version = await deviceInfo.getVersion()`
  - **After**: `const version = deviceInfo.getVersion()`

- `getBuildNumber()`: `Promise<string>` → `string`
  - Returns build number
  - **Before**: `const build = await deviceInfo.getBuildNumber()`
  - **After**: `const build = deviceInfo.getBuildNumber()`

- `getBundleId()`: `Promise<string>` → `string`
  - Returns bundle/package identifier
  - **Before**: `const bundleId = await deviceInfo.getBundleId()`
  - **After**: `const bundleId = deviceInfo.getBundleId()`

- `getApplicationName()`: `Promise<string>` → `string`
  - Returns app display name
  - **Before**: `const name = await deviceInfo.getApplicationName()`
  - **After**: `const name = deviceInfo.getApplicationName()`

**System Resources** (4 methods):

- `getTotalMemory()`: `Promise<number>` → `number`
  - Returns total device RAM in bytes
  - **Before**: `const memory = await deviceInfo.getTotalMemory()`
  - **After**: `const memory = deviceInfo.getTotalMemory()`

- `getUsedMemory()`: `Promise<number>` → `number`
  - Returns current app memory usage in bytes
  - **Before**: `const used = await deviceInfo.getUsedMemory()`
  - **After**: `const used = deviceInfo.getUsedMemory()`

- `getTotalDiskCapacity()`: `Promise<number>` → `number`
  - Returns total storage capacity in bytes
  - **Before**: `const capacity = await deviceInfo.getTotalDiskCapacity()`
  - **After**: `const capacity = deviceInfo.getTotalDiskCapacity()`

- `getFreeDiskStorage()`: `Promise<number>` → `number`
  - Returns available storage in bytes
  - **Before**: `const free = await deviceInfo.getFreeDiskStorage()`
  - **After**: `const free = deviceInfo.getFreeDiskStorage()`

**Device Capabilities** (3 methods):

- `isCameraPresent()`: `Promise<boolean>` → `boolean`
  - Returns camera availability
  - **Before**: `const hasCamera = await deviceInfo.isCameraPresent()`
  - **After**: `const hasCamera = deviceInfo.isCameraPresent()`

- `isPinOrFingerprintSet()`: `Promise<boolean>` → `boolean`
  - Returns biometric security status
  - **Before**: `const hasAuth = await deviceInfo.isPinOrFingerprintSet()`
  - **After**: `const hasAuth = deviceInfo.isPinOrFingerprintSet()`

- `isEmulator()`: `Promise<boolean>` → `boolean`
  - Returns emulator/simulator detection
  - **Before**: `const isEmu = await deviceInfo.isEmulator()`
  - **After**: `const isEmu = deviceInfo.isEmulator()`

**Platform-Specific** (2 methods):

- `getApiLevel()`: `Promise<number>` → `number`
  - Returns Android API level (or -1 on iOS)
  - **Before**: `const apiLevel = await deviceInfo.getApiLevel()`
  - **After**: `const apiLevel = deviceInfo.getApiLevel()`

- `getSupportedAbis()`: `Promise<string[]>` → `string[]`
  - Returns supported CPU architectures
  - **Before**: `const abis = await deviceInfo.getSupportedAbis()`
  - **After**: `const abis = deviceInfo.getSupportedAbis()`

- `hasGms()`: `Promise<boolean>` → `boolean`
  - Returns Google Mobile Services availability (Android only)
  - **Before**: `const gms = await deviceInfo.hasGms()`
  - **After**: `const gms = deviceInfo.hasGms()`

- `hasHms()`: `Promise<boolean>` → `boolean`
  - Returns Huawei Mobile Services availability (Android only)
  - **Before**: `const hms = await deviceInfo.hasHms()`
  - **After**: `const hms = deviceInfo.hasHms()`

### Performance

- All 18 synchronous methods execute in <1ms on both iOS and Android
- Removed unnecessary Promise overhead for cached/in-memory data access
- Benchmark app validates performance targets with 1000 iterations per method

### Migration Guide

#### Simplified Component Usage

**Before (v0.1.0)**:

```typescript
function MyComponent() {
  const [manufacturer, setManufacturer] = useState('');
  const [version, setVersion] = useState('');
  const [battery, setBattery] = useState(0);

  useEffect(() => {
    async function loadData() {
      const mfr = await deviceInfo.getManufacturer();
      const ver = await deviceInfo.getVersion();
      const bat = await deviceInfo.getBatteryLevel();
      setManufacturer(mfr);
      setVersion(ver);
      setBattery(bat);
    }
    loadData();
  }, []);

  return (
    <View>
      <Text>Manufacturer: {manufacturer}</Text>
      <Text>Version: {version}</Text>
      <Text>Battery: {(battery * 100).toFixed(0)}%</Text>
    </View>
  );
}
```

**After (v1.0.0)**:

```typescript
function MyComponent() {
  // Direct synchronous access - no useState, no useEffect, no async/await!
  const manufacturer = deviceInfo.getManufacturer();
  const version = deviceInfo.getVersion();
  const battery = deviceInfo.getBatteryLevel();

  return (
    <View>
      <Text>Manufacturer: {manufacturer}</Text>
      <Text>Version: {version}</Text>
      <Text>Battery: {(battery * 100).toFixed(0)}%</Text>
    </View>
  );
}
```

### Unchanged (Still Asynchronous)

The following methods remain Promise-based as they perform I/O operations:

- `getIpAddress()`: Network interface query
- `getMacAddress()`: Network interface query
- `getCarrier()`: Telephony service query
- `isLocationEnabled()`: Location service query
- `isHeadphonesConnected()`: Audio system query
- `getFirstInstallTime()`: Filesystem attribute read
- `getLastUpdateTime()`: Filesystem attribute read

## [0.1.0] - 2025-10-25

### Added

- Initial release with Nitro Modules integration
- Device information properties (deviceId, brand, systemName, systemVersion, model, deviceType)
- Device capability methods (isTablet, hasNotch, hasDynamicIsland)
- Promise-based async methods for device info access
- iOS and Android native implementations
- Example apps (showcase and benchmark)

[1.4.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.3.1...v1.4.0
[1.3.1]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.3.0...v1.3.1
[1.3.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.2.1...v1.3.0
[1.2.1]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.1.2...v1.2.0
[1.1.2]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v0.1.0
