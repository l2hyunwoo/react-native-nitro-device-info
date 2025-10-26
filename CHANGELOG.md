# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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

[1.0.0]: https://github.com/your-org/react-native-nitro-device-info/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/your-org/react-native-nitro-device-info/releases/tag/v0.1.0
