# DeviceInfo Module

Complete API documentation for the DeviceInfo module. Read the [availability badge definitions](/api/#availability-badges) before choosing an API.

The native build minimums are iOS 15.1 and Android API 24. Dependencies can require higher minimums. Web entry points and fallbacks were added in v1.8.0.

## Import

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

---

## Core Device Information (9 APIs)

Synchronous properties providing instant access to basic device identity.

### `deviceId: string`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Device model identifier.

```typescript
const deviceId = DeviceInfoModule.deviceId;
// iOS: "iPhone14,2"
// Android: "SM-G998B"
```

### `brand: string`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Device brand/manufacturer name.

```typescript
const brand = DeviceInfoModule.brand;
// iOS: "Apple"
// Android: "Samsung", "Google", "OnePlus", etc.
```

### `model: string`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Device model marketing name. Maps the hardware identifier to a human-readable name, falling back to a generic name for unknown devices.

```typescript
const model = DeviceInfoModule.model;
// iOS: "iPhone 18 Pro", "iPhone Duo", "iPad Pro 11-inch (M5)"
// Android: Device-specific model name (e.g., "Pixel 7 Pro", "Galaxy S24")
```

### `systemName: string`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Operating system name.

```typescript
const systemName = DeviceInfoModule.systemName;
// iOS: "iOS" or "iPadOS"
// Android: "Android"
```

### `systemVersion: string`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Operating system version string.

```typescript
const systemVersion = DeviceInfoModule.systemVersion;
// iOS: "15.0", "16.2.1"
// Android: "12", "13", "14"
```

### `deviceType: DeviceType`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Device type category.

```typescript
const deviceType = DeviceInfoModule.deviceType;
// "Handset" | "Tablet" | "Tv" | "Desktop" | "GamingConsole" | "unknown"
```

### `uniqueId: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get unique device identifier.

```typescript
const uniqueId = DeviceInfoModule.uniqueId;
// iOS: IDFV (Identifier for Vendor)
// Android: ANDROID_ID
// Example: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
```

- **iOS**: Reads the current IDFV, or `""` when unavailable. Do not assume that it survives removal of all apps from the vendor.
- **Android**: Reads ANDROID_ID, or `""` when unavailable. Its scope and reset behavior depend on Android.

Do not use this value as a permanent device identity or account identifier. See [Apple IDFV](https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor) and [Android ANDROID_ID](https://developer.android.com/reference/android/provider/Settings.Secure#ANDROID_ID).

### `manufacturer: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Get device manufacturer name.

```typescript
const manufacturer = DeviceInfoModule.manufacturer;
// iOS: "Apple"
// Android: "Samsung", "Google", "Xiaomi", etc.
```

### `deviceName: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get user-assigned device name.

```typescript
const deviceName = DeviceInfoModule.deviceName;
// Example: "John's iPhone", "My Galaxy S21"
```

---

## Device Capabilities (7 APIs)

Boolean checks for device features and hardware availability.

### `isTablet: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if device is a tablet.

```typescript
const isTablet = DeviceInfoModule.isTablet;
// iPad → true
// iPhone → false
```

- **iOS**: Based on UIDevice.userInterfaceIdiom
- **Android**: Based on smallest screen width >= 600dp

### `isEmulator: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if running in simulator/emulator.

```typescript
const isEmulator = DeviceInfoModule.isEmulator;
```

### `deviceYearClass: number`

<span class="rp-badge rp-badge--tip">Since v1.4.2</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get estimated device year class based on hardware specifications.

```typescript
const yearClass = DeviceInfoModule.deviceYearClass;

if (yearClass >= 2020) {
  enableHighEndFeatures();
} else if (yearClass >= 2015) {
  enableStandardFeatures();
} else {
  enableLowEndFeatures();
}
```

Returns an estimated "year class" representing when this device's hardware would have been considered flagship/high-end. Based on extended Facebook device-year-class algorithm updated for 2025.

**RAM → Year Class mapping**:

| RAM | Year Class | Example Devices |
|-----|------------|-----------------|
| ≤2 GB | 2013 | Budget devices |
| ≤4 GB | 2015 | Mid-range 2015-2016 |
| ≤6 GB | 2017 | Flagship 2017-2018 |
| ≤8 GB | 2019 | Flagship 2019-2020 |
| ≤12 GB | 2021 | Flagship 2021-2022 |
| ≤16 GB | 2023 | Flagship 2023-2024 |
| >16 GB | 2025 | Latest flagships |

### `isCameraPresent: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (since v1.9.0)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

The iOS implementation is available from v1.9.0. Published versions through v1.8.3 return `true` unconditionally. See the [implementation change](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/be976f0).

Check if camera hardware is available. On iOS, returns `false` on the simulator or when no video capture device exists. This check does not request camera permission; a `true` result does not mean the app has permission to capture video.

```typescript
const hasCamera = DeviceInfoModule.isCameraPresent;
```

### `isPinOrFingerprintSet: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (since v1.9.0)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

The iOS implementation is available from v1.9.0. Published versions through v1.8.3 return `false` unconditionally. See the [implementation change](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/801903e).

Check if PIN, fingerprint, or Face ID is configured. On iOS, checks whether device-owner authentication is available, including the device passcode fallback when biometrics are unavailable or locked out. Returns `false` when no passcode is set. This check does not authenticate the user or show a prompt; the result is checked again on each read.

```typescript
const isSecure = DeviceInfoModule.isPinOrFingerprintSet;
```

### `isHardwareKeyStoreAvailable: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.1</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: limited</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check platform key-storage availability. Android does not verify hardware backing.

```typescript
const hasHardwareKeyStore = DeviceInfoModule.isHardwareKeyStoreAvailable;

if (hasHardwareKeyStore) {
  console.log('Platform key-storage check passed');
  // Apply your key-storage policy; this check alone is not a security guarantee.
} else {
  console.log('Platform key storage unavailable');
  // Use alternative security measures
}
```

**Platform limits**: iOS checks Secure Enclave availability. Android only checks whether `AndroidKeyStore` can be opened; it does not prove that a key is hardware-backed.

### `isLowRamDevice: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if device is classified as low RAM device.

```typescript
const isLowRam = DeviceInfoModule.isLowRamDevice;
// Android API 19+: true/false
// iOS: false
```

**Platform**: Android. The OS classification API exists from API 19, but this package requires API 24+.

---

## Display & Screen (7 APIs)

Screen and display-related properties.

### `getHasNotch(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if device has a display notch.

```typescript
const hasNotch = DeviceInfoModule.getHasNotch();
// iPhone X, 11, 12, 13 → true
// iPhone SE, 8 → false
```

- **iOS only** - Detects iPhone X and later models
- **Android**: Always returns `false`

### `getHasDynamicIsland(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 16+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if device has Dynamic Island.

```typescript
const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland();
// iPhone 14 Pro, 15 Pro → true
// iPhone 14, 13 → false
```

- **iOS 16+ only** - iPhone 14 Pro and later
- **Android**: Always returns `false`

### `isDisplayZoomed: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if iOS Display Zoom is enabled.

```typescript
const isZoomed = DeviceInfoModule.isDisplayZoomed;
// iOS: true/false based on display zoom setting
// Android: false
```

**Platform**: iOS only

### `getIsLandscape(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Check if device is in landscape orientation.

```typescript
const isLandscape = DeviceInfoModule.getIsLandscape();
```

### `getBrightness(): number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get current screen brightness level (0.0 to 1.0).

```typescript
const brightness = DeviceInfoModule.getBrightness();
console.log(`Brightness: ${(brightness * 100).toFixed(0)}%`);
// iOS: 0.0 to 1.0
// Android: -1
```

**Platform**: iOS only

### `getFontScale(): number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get current font scale multiplier.

```typescript
const fontScale = DeviceInfoModule.getFontScale();
// Example: 1.0 (normal), 1.2 (large), 0.85 (small)
```

### `isLiquidGlassAvailable: boolean`

<span class="rp-badge rp-badge--tip">Since v1.2.1</span> <span class="rp-badge rp-badge--info">iOS 26+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if the liquid glass effect is available on the device.

```typescript
const hasLiquidGlass = DeviceInfoModule.isLiquidGlassAvailable;

if (hasLiquidGlass) {
  console.log('Liquid glass effect available');
  // Can use new iOS 26+ design features
} else {
  console.log('Liquid glass not available');
  // Fallback to standard UI
}
```

**Platform**: iOS 26.0+

Requires a Swift 6.2+ compiler. Returns `false` on older compiler builds or when `UIDesignRequiresCompatibility` is enabled.

---

## System Resources (7 APIs)

Memory, storage, and uptime information.

### `totalMemory: number`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Get total device RAM in bytes.

```typescript
const totalMemory = DeviceInfoModule.totalMemory;
// Example: 6442450944 (6 GB)
console.log(`Total RAM: ${(totalMemory / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUsedMemory(): number`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get current app memory usage in bytes.

```typescript
const usedMemory = DeviceInfoModule.getUsedMemory();
// Example: 134217728 (128 MB)
console.log(`Used Memory: ${(usedMemory / 1024 / 1024).toFixed(0)}MB`);
```

### `maxMemory: number`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get maximum memory available to app (in bytes).

```typescript
const maxMemory = DeviceInfoModule.maxMemory;
// Android: max heap size
// iOS: -1
```

**Platform**: Android only

### `totalDiskCapacity: number`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get total internal storage size in bytes.

```typescript
const totalDisk = DeviceInfoModule.totalDiskCapacity;
// Example: 128849018880 (120 GB)
console.log(`Total Storage: ${(totalDisk / 1024 / 1024 / 1024).toFixed(0)}GB`);
```

### `getFreeDiskStorage(): number`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get available free storage space in bytes.

```typescript
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
// Example: 51539607552 (48 GB)
console.log(`Free Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUptime(): number`

<span class="rp-badge rp-badge--tip">Since v1.4.2</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get device uptime since boot in milliseconds, excluding deep sleep time.

On iOS, use this clock only for app-event timing: elapsed time or timers (`35F9.1`), or app-event uptime converted into an absolute timestamp using `startupTime` (`8FFB.1`). Do not display or collect raw uptime as general device information, send it off-device, or use it for fingerprinting. Only elapsed time between app events or the resulting absolute app-event timestamps may be sent off-device.

```typescript
const startedAt = DeviceInfoModule.getUptime();
const usedMemory = DeviceInfoModule.getUsedMemory();
const elapsedMs = DeviceInfoModule.getUptime() - startedAt;
console.log({ usedMemory, elapsedMs });
```

**Platform behavior**:
- **iOS**: Uses `systemUptime` (excludes deep sleep)
- **Android**: Uses `uptimeMillis()` (excludes deep sleep)

Both platforms return consistent "active time" since boot, matching the behavior of `expo-device.getUptimeAsync()`.

### `startupTime: number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get device boot time (milliseconds since epoch).

On iOS, use this value only as the time base for converting app-event uptime into an absolute timestamp (`8FFB.1`). Do not display or collect the raw boot timestamp as general device information, send it off-device, or use it for fingerprinting. Only the resulting absolute timestamps of events within the app may be sent off-device.

```typescript
// iOS: capture an event occurring in the app using the same uptime clock.
const eventUptime = DeviceInfoModule.getUptime();
const eventTimestamp = DeviceInfoModule.startupTime + eventUptime;
console.log(`App event at: ${new Date(eventTimestamp).toISOString()}`);
```

This is the device boot time, not app startup time. See [iOS Privacy Manifest](../guide/getting-started.md#ios-privacy-manifest) for the supported purposes and Apple's usage limits.

---

## Battery & Power (4 APIs)

Battery and power state information.

### `getBatteryLevel(): number`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Get current battery level (0.0 to 1.0), or `-1` if unavailable. A known empty battery returns `0`.

On web, battery getters read the live BatteryManager after the initial async
request resolves. Before resolution, or if the API is unavailable or denied,
level is `-1`, charging is `false`, battery state is `"unknown"`, and
`isLowBatteryLevel()` returns `false`.

```typescript
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(batteryLevel * 100).toFixed(0)}%`);
// Output: "Battery: 75%"
```

### `getPowerState(): PowerState`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: limited</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

On Android, `lowPowerMode` is always `false`. Battery level and charging state are implemented.

Get comprehensive power state information.

```typescript
const powerState = DeviceInfoModule.getPowerState();
console.log(powerState.batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`); // iOS only
```

**PowerState** interface:

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 to 1.0, or -1 if unavailable
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS only
}
```

### `getIsBatteryCharging(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Check if battery is currently charging.

```typescript
const isCharging = DeviceInfoModule.getIsBatteryCharging();
```

### `isLowBatteryLevel(threshold: number): boolean`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Check if a valid battery level is below threshold. Returns `false` for an unavailable reading; a known `0%` reading still counts as low.

```typescript
const isLowBattery = DeviceInfoModule.isLowBatteryLevel(0.2); // 20%
if (isLowBattery) {
  console.log('Battery is low, please charge');
}
```

---

## Application Metadata (9 APIs)

App bundle and version information.

### `version: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get application version string.

```typescript
const version = DeviceInfoModule.version;
// Example: "1.2.3"
```

### `buildNumber: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get application build number.

```typescript
const buildNumber = DeviceInfoModule.buildNumber;
// Example: "42" or "20231025"
```

### `bundleId: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get bundle ID (iOS) or package name (Android).

```typescript
const bundleId = DeviceInfoModule.bundleId;
// Example: "com.company.app"
```

### `applicationName: string`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get application display name.

```typescript
const appName = DeviceInfoModule.applicationName;
// Example: "My Awesome App"
```

### `readableVersion: string`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get human-readable version string (version.buildNumber).

```typescript
const readableVersion = DeviceInfoModule.readableVersion;
// Example: "1.2.3.42"
```

### `getFirstInstallTime(): Promise<number>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: limited</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

On iOS, this estimates installation time from the Documents directory creation time. It returns `0` when unavailable.

Get timestamp when app was first installed (ms since epoch).

```typescript
const installTime = await DeviceInfoModule.getFirstInstallTime();
const installDate = new Date(installTime);
console.log(`Installed: ${installDate.toLocaleDateString()}`);
```


### `getLastUpdateTime(): Promise<number>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: limited</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get timestamp of most recent app update (ms since epoch).

```typescript
const updateTime = await DeviceInfoModule.getLastUpdateTime();
const updateDate = new Date(updateTime);
console.log(`Last Updated: ${updateDate.toLocaleDateString()}`);
```

**iOS limitation**: Reads the Documents directory modification time, not an App Store update timestamp. Returns `0` if unavailable.

### `firstInstallTimeSync: number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: limited</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

On iOS, this caches the Documents directory creation time on first access. It returns `0` when unavailable.

Synchronous version of `getFirstInstallTime()`.

```typescript
const firstInstallTimeSync = DeviceInfoModule.firstInstallTimeSync;
```

### `lastUpdateTimeSync: number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant (returns -1 on iOS).

```typescript
const lastUpdateTimeSync = DeviceInfoModule.lastUpdateTimeSync;
```

---

## Network (6 APIs)

Network connectivity APIs (excluding carrier).

### `getIpAddress(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get device local IP address.

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
// Example: "192.168.1.100", "10.0.0.5"
```


### `getIpAddressSync(): string`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant (with 5-second cache).

```typescript
const ipAddressSync = DeviceInfoModule.getIpAddressSync();
```

### `getMacAddress(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get the Wi-Fi MAC address when Android allows access. Android uses the same 5-second cache as `getMacAddressSync()` and returns `"unknown"` when the address is unavailable. [Non-system apps generally cannot access hardware MAC addresses](https://developer.android.com/reference/java/net/NetworkInterface#getHardwareAddress()) on modern Android; this API does not bypass those restrictions.

```typescript
const macAddress = await DeviceInfoModule.getMacAddress();
// iOS: "02:00:00:00:00:00" (hardcoded since iOS 7 for privacy)
// Android: "unknown" when restricted, otherwise the available wlan0 MAC
```


### `getMacAddressSync(): string`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant, sharing the same Android lookup, 5-second cache, and `"unknown"` fallback.

```typescript
const macAddressSync = DeviceInfoModule.getMacAddressSync();
```

### `getUserAgent(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Get HTTP User-Agent string.

```typescript
const userAgent = await DeviceInfoModule.getUserAgent();
// Example: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ..."
```

iOS initializes a WebView and caches the first successful result. Android queries `WebSettings` asynchronously. Both platforms return a `Promise<string>`.

### `getIsAirplaneMode(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if airplane mode is enabled.

On web this always returns `false`: browsers cannot determine airplane mode.
Being offline does not establish that airplane mode is enabled.

```typescript
const isAirplaneMode = DeviceInfoModule.getIsAirplaneMode();
// Android: true/false
// iOS and web: false (not available)
```

**Platform**: Android only

---

## Carrier Information (7 APIs)

Cellular carrier data for telecom apps, analytics, and geo-detection.

### `getCarrier(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (since v1.8.0)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

iOS has a functional implementation from v1.8.0. Earlier async versions return a fixed fallback, even when a synchronous counterpart is implemented. See the [iOS implementation change](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026).

Get cellular carrier name.

```typescript
const carrier = await DeviceInfoModule.getCarrier();
// Example: "Verizon", "AT&T", "T-Mobile"
```


### `getCarrierSync(): string`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant (with 5-second cache).

```typescript
const carrierSync = DeviceInfoModule.getCarrierSync();
```

### `carrierAllowsVOIP: boolean`

<span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if carrier allows VoIP calls on its network.

```typescript
const allowsVOIP = DeviceInfoModule.carrierAllowsVOIP;
// iOS: true/false based on carrier policy
// Android: always true (no equivalent API)
```

**Platform**: iOS only (always returns `true` on Android)

### `carrierIsoCountryCode: string`

<span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get ISO 3166-1 alpha-2 country code for the carrier.

```typescript
const countryCode = DeviceInfoModule.carrierIsoCountryCode;
// Example: "US", "KR", "JP", "DE"
// Returns "" if no SIM card
```

### `mobileCountryCode: string`

<span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get Mobile Country Code (MCC) per ITU-T Recommendation E.212.

```typescript
const mcc = DeviceInfoModule.mobileCountryCode;
// Example: "310" (USA), "450" (Korea), "440" (Japan)
// Returns "" if no carrier
```

**Common MCC values**:

| Country | MCC |
|---------|-----|
| USA | 310-316 |
| Korea | 450 |
| Japan | 440-441 |
| China | 460 |
| Germany | 262 |

### `mobileNetworkCode: string`

<span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get Mobile Network Code (MNC) that identifies the carrier within a country.

```typescript
const mnc = DeviceInfoModule.mobileNetworkCode;
// Example: "260" (T-Mobile US), "05" (SKT Korea)
// Returns "" if no carrier
```

### `mobileNetworkOperator: string`

<span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get combined MCC + MNC string.

```typescript
const operator = DeviceInfoModule.mobileNetworkOperator;
// Example: "310260" (T-Mobile US), "45005" (SKT Korea)
// Equivalent to: mobileCountryCode + mobileNetworkCode
// Returns "" if no carrier
```

**Use cases**:
- Carrier-specific feature toggling
- Regional content delivery
- Telecom analytics
- Fraud detection (geo-location verification)

---

## Audio Accessories (4 APIs)

Audio device detection.

### `isHeadphonesConnected(): Promise<boolean>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (since v1.8.0)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

iOS has a functional implementation from v1.8.0. Earlier async versions return a fixed fallback, even when a synchronous counterpart is implemented. See the [iOS implementation change](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026).

Check if headphones are connected (wired or Bluetooth). On Android, this uses the same output-device detection as the synchronous getter.

```typescript
const hasHeadphones = await DeviceInfoModule.isHeadphonesConnected();
```


### `getIsHeadphonesConnected(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant.

```typescript
const isHeadphonesConnected = DeviceInfoModule.getIsHeadphonesConnected();
```

### `getIsWiredHeadphonesConnected(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if wired headphones are connected. On Android, this includes wired headphones/headsets and [USB headsets on API 26+](https://developer.android.com/reference/android/media/AudioDeviceInfo#TYPE_USB_HEADSET). Built-in speakers and Bluetooth devices do not count as wired headphones.

```typescript
const hasWiredHeadphones = DeviceInfoModule.getIsWiredHeadphonesConnected();
```

### `getIsBluetoothHeadphonesConnected(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if Bluetooth headphones are connected.

```typescript
const hasBluetoothHeadphones = DeviceInfoModule.getIsBluetoothHeadphonesConnected();
```

---

## Location Services (3 APIs)

Location provider information.

### `isLocationEnabled(): Promise<boolean>`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (since v1.8.0)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

iOS has a functional implementation from v1.8.0. Earlier async versions return a fixed fallback, even when a synchronous counterpart is implemented. See the [iOS implementation change](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026).

Check if location services are enabled.

```typescript
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();
```


### `getIsLocationEnabled(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Synchronous variant.

```typescript
const isLocationEnabled = DeviceInfoModule.getIsLocationEnabled();
```

### `getAvailableLocationProviders(): string[]`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get list of enabled location providers.

```typescript
const providers = DeviceInfoModule.getAvailableLocationProviders();
// ["gps", "network"]
```

---

## Localization (1 API)

Language and regional settings.

### `systemLanguage: string`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Get device system language in BCP 47 format.

```typescript
const language = DeviceInfoModule.systemLanguage;
// iOS: "en-US", "ko-KR", "ja-JP", "zh-Hans-CN"
// Android: "en-US", "ko-KR", "ja-JP", "zh-Hans-CN"
```

**Examples**:

| Language | Code |
|----------|------|
| English (US) | `en-US` |
| Korean | `ko-KR` |
| Japanese | `ja-JP` |
| Simplified Chinese | `zh-Hans-CN` |
| French (France) | `fr-FR` |
| German | `de-DE` |

**Use Case**:

```typescript
const language = DeviceInfoModule.systemLanguage;

if (language.startsWith('ko')) {
  console.log('Korean device detected');
} else if (language.startsWith('ja')) {
  console.log('Japanese device detected');
}
```

---

## CPU & Architecture (3 APIs)

Processor and ABI information.

### `supportedAbis: string[]`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get supported CPU architectures.

```typescript
const abis = DeviceInfoModule.supportedAbis;
// iOS: ["arm64"]
// Android: ["arm64-v8a", "armeabi-v7a"]
```

### `supported32BitAbis: string[]`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get list of supported 32-bit ABIs.

```typescript
const abis32 = DeviceInfoModule.supported32BitAbis;
// iOS: []
// Android API 21+: ["armeabi-v7a", "x86"]
```

**Platform**: Android API 21+, returns `[]` on iOS

### `supported64BitAbis: string[]`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get list of supported 64-bit ABIs.

```typescript
const abis64 = DeviceInfoModule.supported64BitAbis;
// iOS: ["arm64"]
// Android API 21+: ["arm64-v8a", "x86_64"]
```

---

## Android Platform (20+ APIs)

Android-specific APIs and build information.

### `apiLevel: number`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get Android API level.

```typescript
const apiLevel = DeviceInfoModule.apiLevel;
// Android 12 → 31
// Android 13 → 33
// iOS → -1
```

**Platform**: Android only

### `navigationMode: NavigationMode`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get Android navigation mode.

```typescript
const navMode = DeviceInfoModule.navigationMode;
// Android with gesture nav → "gesture"
// Android with 3-button nav → "buttons"
// Android with 2-button nav → "twobuttons"
// iOS → "unknown"
```

**Type**: `'gesture' | 'buttons' | 'twobuttons' | 'unknown'`

**Platform**: Android only (returns "unknown" on iOS)

**Values**:

| Value | Description |
|-------|-------------|
| `gesture` | Full gesture navigation (swipe-based) |
| `buttons` | Traditional 3-button navigation (Back, Home, Recent) |
| `twobuttons` | 2-button navigation (Back, Home with swipe up) |
| `unknown` | Cannot determine (always on iOS) |

**Use Case**:

```typescript
const navMode = DeviceInfoModule.navigationMode;

if (navMode === 'gesture') {
  // Avoid bottom gesture conflicts
  // Add extra bottom padding for bottom sheets
  console.log('Using gesture navigation - add extra padding');
} else if (navMode === 'buttons') {
  // Traditional navigation bar is present
  console.log('Using button navigation');
}
```

**Note**: Navigation mode detection requires Android 10 (API 29) or later. On older Android versions, returns `"buttons"` since gesture navigation was not available.

### `getHasGms(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if Google Mobile Services is available.

```typescript
const hasGms = DeviceInfoModule.getHasGms();
// Android with Play Services → true
// Huawei devices without GMS → false
// iOS → false
```

**Platform**: Android only

### `getHasHms(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.3.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if Huawei Mobile Services is available.

```typescript
const hasHms = DeviceInfoModule.getHasHms();
// Huawei devices → true
// Other Android/iOS → false
```

**Platform**: Android (Huawei devices) only

### `hasSystemFeature(feature: string): boolean`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if specific system feature is available.

```typescript
const hasNfc = DeviceInfoModule.hasSystemFeature('android.hardware.nfc');
// Android → true/false based on hardware
// iOS → false
```

**Platform**: Android only

**Common features**:

- `android.hardware.camera`
- `android.hardware.nfc`
- `android.hardware.bluetooth`
- `android.hardware.wifi`

### `systemAvailableFeatures: string[]`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get list of all available system features.

```typescript
const features = DeviceInfoModule.systemAvailableFeatures;
// Android: ["android.hardware.camera", "android.hardware.nfc", ...]
// iOS: []
```

**Platform**: Android only

### `supportedMediaTypeList: string[]`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get list of supported media/codec types.

```typescript
const mediaTypes = DeviceInfoModule.supportedMediaTypeList;
// Android: ["video/avc", "audio/mp4a-latm", ...]
// iOS: []
```

**Platform**: Android only

### Android Build Information

Synchronous properties providing Android system build information.

**Platform**: Android only (all return "unknown" or default values on iOS)

```typescript
const serialNumber = DeviceInfoModule.serialNumber; // Android 8–9 needs granted READ_PHONE_STATE; Android 10+ is restricted
const androidId = DeviceInfoModule.androidId;
const previewSdkInt = DeviceInfoModule.previewSdkInt; // Android API 23+, 0 for release
const securityPatch = DeviceInfoModule.securityPatch; // Android API 23+, "YYYY-MM-DD"
const codename = DeviceInfoModule.codename; // "REL" for release
const incremental = DeviceInfoModule.incremental;
const board = DeviceInfoModule.board;
const bootloader = DeviceInfoModule.bootloader;
const device = DeviceInfoModule.device; // Board/platform name
const display = DeviceInfoModule.display; // Build display ID
const fingerprint = DeviceInfoModule.fingerprint; // Unique build identifier
const hardware = DeviceInfoModule.hardware;
const host = DeviceInfoModule.host; // Build host machine
const product = DeviceInfoModule.product;
const tags = DeviceInfoModule.tags; // Comma-separated
const type = DeviceInfoModule.type; // "user", "userdebug", "eng"
const baseOs = DeviceInfoModule.baseOs; // Android API 23+
const radioVersion = DeviceInfoModule.radioVersion;
const buildId = DeviceInfoModule.buildId;
```

| Property | Availability |
| --- | --- |
| `serialNumber` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--warning">Android API 24+: limited</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `androidId` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `previewSdkInt` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `securityPatch` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `codename` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `incremental` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `board` | <span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `bootloader` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `device` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `display` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `fingerprint` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `hardware` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `host` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `product` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `tags` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `type` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `baseOs` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `radioVersion` | <span class="rp-badge rp-badge--tip">Since v1.5.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |
| `buildId` | <span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> |

`serialNumber` is cached on first access. Android 8–9 requires a granted `READ_PHONE_STATE` permission. Android 10+ restricts ordinary apps even with that permission.

---

## iOS Platform (2 APIs)

iOS-specific APIs.

### `getDeviceToken(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: rejects</span> <span class="rp-badge rp-badge--warning">Web: rejects</span>

Get Apple DeviceCheck token.

```typescript
try {
  const deviceToken = await DeviceInfoModule.getDeviceToken();
  console.log('DeviceCheck token:', deviceToken);
} catch (error) {
  console.error('DeviceCheck error:', error);
}
```

**Platform**: iOS. DeviceCheck exists from iOS 11, but this package requires iOS 15.1+. Rejects on Android.

### `syncUniqueId(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: ID only</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Write the current IDFV to an app-specific Keychain item on iOS. This method does not enable iCloud Keychain synchronization or restore an earlier IDFV.

```typescript
const uniqueId = await DeviceInfoModule.syncUniqueId();
// iOS: Writes and returns the current IDFV.
// Android: Returns uniqueId without a Keychain operation.
```

**Platform**: iOS (no-op on Android)

---

## Installation & Distribution (3 APIs)

App installation and distribution metadata.

### `installerPackageName: string`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get package name of the app store that installed this app.

```typescript
const installer = DeviceInfoModule.installerPackageName;
// iOS: "com.apple.AppStore", "com.apple.TestFlight"
// Android: "com.android.vending" (Play Store)
```

### `getInstallReferrer(): Promise<string>`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get install referrer information (Android Play Store).

```typescript
const referrer = await DeviceInfoModule.getInstallReferrer();
// Android with Play Services: referrer data
// iOS: "unknown"
```

**Platform**: Android only (requires Google Play Services)

### `isSideLoadingEnabled(): boolean`

<span class="rp-badge rp-badge--tip">Since v1.4.2</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Check if sideloading (installing from unknown sources) is enabled.

```typescript
const canSideload = DeviceInfoModule.isSideLoadingEnabled();

if (canSideload) {
  console.warn('Device allows sideloading - potential security risk');
}
```

**Platform behavior difference**:
- **Android 7 and below**: Returns whether the device allows unknown sources globally (checks `Settings.Global.INSTALL_NON_MARKET_APPS`)
- **Android 8.0+**: Returns whether THIS APP has permission to install other apps (per-app permission via `canRequestPackageInstalls()`)
- **iOS**: This API always returns `false`; it does not detect sideloading.

**Important**: On Android 8.0+, even if the user has enabled "Install unknown apps" for other apps, this will return `false` unless they specifically granted permission to this app.

**Use cases**:
- Security policy enforcement
- Distribution channel detection
- Enterprise deployment verification

**Platform**: Android (returns `false` on iOS)

---

## Legacy Compatibility (2 APIs)

Deprecated APIs for backward compatibility.

### `totalDiskCapacityOld: number`

<span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get total disk capacity using legacy Android API.

```typescript
const totalDiskOld = DeviceInfoModule.totalDiskCapacityOld;
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to totalDiskCapacity
```

### `getFreeDiskStorageOld(): number`

<span class="rp-badge rp-badge--tip">Since v1.1.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Get free disk storage using legacy Android API.

```typescript
const freeDiskOld = DeviceInfoModule.getFreeDiskStorageOld();
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to getFreeDiskStorage()
```

---

### Unsupported compatibility properties

These names exist for API compatibility. This package has no Windows native target. They return fixed defaults on iOS, Android, and web.

| Property | Availability | Default |
| --- | --- | --- |
| `isMouseConnected` | <span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> | `false` |
| `isKeyboardConnected` | <span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> | `false` |
| `hostNames` | <span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> | `[]` |
| `isTabletMode` | <span class="rp-badge rp-badge--tip">Since v1.2.0</span> <span class="rp-badge rp-badge--warning">iOS: fallback</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span> | `false` |

---

## Performance Notes

Synchronous properties and methods run on the calling thread. Some query the OS or initialize a cache, so synchronous does not mean instantaneous.

Promise-based methods do not have a guaranteed completion time. On iOS, `getUserAgent()` initializes a WebView on its first successful call and caches that result. Avoid repeated calls to expensive APIs during rendering.

### Caching

These synchronous methods use a five-second cache:

- `getIpAddressSync()`
- `getMacAddressSync()`
- `getCarrierSync()`

A cache refresh queries the OS. Values can remain stale until the next call after expiry. For continuously changing battery or audio state, use [React hooks](/api/hooks).

Measure latency in your app with its actual device, OS, build mode, and cache state.

---

## Platform Compatibility Matrix

Support differs between members in the same category. Use the badges beside each API or grouped property above. See [badge definitions](/api/#availability-badges) and [web limitations](/guide/web-support).

---

## Next Steps

- View [Type Definitions](/api/types) for TypeScript types
- Check out [Usage Examples](/examples/basic-usage)
- Read the [Migration Guide](/api/migration) for upgrading from `react-native-device-info`
