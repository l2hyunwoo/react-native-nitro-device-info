# API Reference Overview

Complete API documentation for `react-native-nitro-device-info`.

## Module Import

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, BatteryState, DeviceType } from 'react-native-nitro-device-info';
```

## API Organization

The API is organized into the following categories:

### [Core Device Information](/api/device-info#core-device-information)

Synchronous properties providing instant access to basic device information:
- `deviceId`, `brand`, `model` - Device identification
- `systemName`, `systemVersion` - OS information
- `deviceType` - Device category (Handset, Tablet, etc.)

### [Device Capabilities](/api/device-info#device-capabilities)

Methods to check device features and hardware:
- `isTablet()` - Tablet detection
- `hasNotch()`, `hasDynamicIsland()` - Display features
- `isCameraPresent()`, `isPinOrFingerprintSet()` - Hardware checks
- `isEmulator()` - Simulator/emulator detection

### [Device Identification](/api/device-info#device-identification)

Unique identifiers and manufacturer information:
- `getUniqueId()` - Platform-specific unique ID
- `getManufacturer()` - Device manufacturer

### [System Resources](/api/device-info#system-resources)

Memory and storage monitoring:
- `getTotalMemory()`, `getUsedMemory()` - RAM information
- `getTotalDiskCapacity()`, `getFreeDiskStorage()` - Storage information

### [Battery Information](/api/device-info#battery-information)

Battery status and power state:
- `getBatteryLevel()` - Current battery level (0.0-1.0)
- `getPowerState()` - Comprehensive power state
- `isBatteryCharging()` - Charging status
- `isLowBatteryLevel(threshold)` - Low battery check

### [Application Metadata](/api/device-info#application-metadata)

Information about your application:
- `getVersion()`, `getBuildNumber()` - App version info
- `getBundleId()`, `getApplicationName()` - App identity
- `getFirstInstallTime()`, `getLastUpdateTime()` - Installation timestamps

### [Network & Connectivity](/api/device-info#network--connectivity)

Network and connectivity information (mostly async):
- `getIpAddress()` - Local IP address
- `getCarrier()` - Cellular carrier name
- `isLocationEnabled()` - Location services status
- `isHeadphonesConnected()` - Audio output detection

### [Platform-Specific Methods](/api/device-info#platform-specific-methods)

Platform-specific functionality:
- `getApiLevel()` - Android API level
- `getSupportedAbis()` - CPU architectures
- `hasGms()`, `hasHms()` - Mobile services detection
- `hasSystemFeature(feature)` - Android feature detection

### [Android Build Information](/api/device-info#android-build-information)

Android system build details:
- `serialNumber`, `androidId`, `securityPatch`
- `fingerprint`, `bootloader`, `hardware`
- And many more build properties

### [Advanced Capabilities](/api/device-info#advanced-capabilities)

Advanced device state and features:
- `isAirplaneMode()` - Airplane mode status
- `isLowRamDevice()` - Low RAM device detection
- `isLandscape()` - Orientation detection
- Headphone type detection

### [iOS-Specific Features](/api/device-info#ios-specific-features)

iOS-exclusive functionality:
- `isDisplayZoomed()` - Display Zoom setting
- `getBrightness()` - Screen brightness
- `getDeviceToken()` - DeviceCheck token
- `syncUniqueId()` - iCloud Keychain sync

## API Characteristics

### Synchronous vs Asynchronous

**Synchronous (<1ms)**:
- Core device properties
- Device identification
- System resources (memory, disk)
- Battery information
- Application metadata

**Asynchronous (10-100ms)**:
- Network information (IP, MAC, carrier)
- Location services status
- Installation timestamps
- Some connectivity checks

**Very Slow (500-2000ms)**:
- `getUserAgent()` on iOS (first call)
- `getDeviceToken()` on iOS

### Performance Tips

1. **Use synchronous methods** when available - they return instantly
2. **Cache async results** for values that don't change frequently
3. **Batch async calls** using `Promise.all()` for parallel execution
4. **Use sync variants** for cached network values (`ipAddressSync`, `carrierSync`)

## Type Definitions

The library includes full TypeScript definitions. See [Type Definitions](/api/types) for detailed information about:
- `PowerState` - Battery and power state
- `BatteryState` - Battery charging status
- `DeviceType` - Device category types

## Migration Guide

If you're migrating from `react-native-device-info`, check out the [Migration Guide](/api/migration) for:
- API compatibility overview
- Key differences
- Migration examples
- Breaking changes

## Platform Compatibility

Most APIs work on both iOS and Android, with some platform-specific features:

- **iOS-only**: `hasNotch()`, `hasDynamicIsland()`, `getBrightness()`, `getDeviceToken()`
- **Android-only**: `getApiLevel()`, Android Build info, `hasGms()`, `hasSystemFeature()`

See the [DeviceInfo Module](/api/device-info) page for detailed platform compatibility information.

## Next Steps

- Explore the [Complete API Reference](/api/device-info)
- Check out [Type Definitions](/api/types)
- Read the [Migration Guide](/api/migration)
- View [Examples](/examples/basic-usage)
