# DeviceInfo Module

Complete API documentation for the DeviceInfo module.

## Import

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

## Core Device Information

Synchronous properties providing instant access to basic device information.

### Properties

#### `deviceId: string`

Device model identifier.

```typescript
const deviceId = DeviceInfoModule.deviceId;
// iOS: "iPhone14,2"
// Android: "SM-G998B"
```

#### `brand: string`

Device brand/manufacturer name.

```typescript
const brand = DeviceInfoModule.brand;
// iOS: "Apple"
// Android: "Samsung", "Google", "OnePlus", etc.
```

#### `systemName: string`

Operating system name.

```typescript
const systemName = DeviceInfoModule.systemName;
// iOS: "iOS" or "iPadOS"
// Android: "Android"
```

#### `systemVersion: string`

Operating system version string.

```typescript
const systemVersion = DeviceInfoModule.systemVersion;
// iOS: "15.0", "16.2.1"
// Android: "12", "13", "14"
```

#### `model: string`

Device model name.

```typescript
const model = DeviceInfoModule.model;
// iOS: "iPhone", "iPad"
// Android: Device-specific model name
```

#### `deviceType: DeviceType`

Device type category.

```typescript
const deviceType = DeviceInfoModule.deviceType;
// "Handset" | "Tablet" | "Tv" | "Desktop" | "GamingConsole" | "unknown"
```

---

## Device Capabilities

### `isTablet(): boolean`

Check if device is a tablet.

```typescript
const isTablet = DeviceInfoModule.isTablet();
// iPad → true
// iPhone → false
```

- **iOS**: Based on UIDevice.userInterfaceIdiom
- **Android**: Based on smallest screen width >= 600dp

### `hasNotch(): boolean`

Check if device has a display notch.

```typescript
const hasNotch = DeviceInfoModule.hasNotch();
// iPhone X, 11, 12, 13 → true
// iPhone SE, 8 → false
```

- **iOS only** - Detects iPhone X and later models
- **Android**: Always returns `false`

### `hasDynamicIsland(): boolean`

Check if device has Dynamic Island.

```typescript
const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland();
// iPhone 14 Pro, 15 Pro → true
// iPhone 14, 13 → false
```

- **iOS 16+ only** - iPhone 14 Pro and later
- **Android**: Always returns `false`

### `isCameraPresent(): boolean`

Check if camera is available.

```typescript
const hasCamera = DeviceInfoModule.isCameraPresent();
```

### `isPinOrFingerprintSet(): boolean`

Check if PIN, fingerprint, or Face ID is configured.

```typescript
const isSecure = DeviceInfoModule.isPinOrFingerprintSet();
```

### `isEmulator(): boolean`

Check if running in simulator/emulator.

```typescript
const isEmulator = DeviceInfoModule.isEmulator();
```

---

## Device Identification

### `getUniqueId(): string`

Get unique device identifier.

```typescript
const uniqueId = DeviceInfoModule.getUniqueId();
// iOS: IDFV (Identifier for Vendor)
// Android: ANDROID_ID
// Example: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
```

- **iOS**: Persists across app installs from the same vendor
- **Android**: Usually persists across app installs

### `getManufacturer(): string`

Get device manufacturer name.

```typescript
const manufacturer = DeviceInfoModule.getManufacturer();
// iOS: "Apple"
// Android: "Samsung", "Google", "Xiaomi", etc.
```

---

## System Resources

### `getTotalMemory(): number`

Get total device RAM in bytes.

```typescript
const totalMemory = DeviceInfoModule.getTotalMemory();
// Example: 6442450944 (6 GB)
console.log(`Total RAM: ${(totalMemory / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUsedMemory(): number`

Get current app memory usage in bytes.

```typescript
const usedMemory = DeviceInfoModule.getUsedMemory();
// Example: 134217728 (128 MB)
console.log(`Used Memory: ${(usedMemory / 1024 / 1024).toFixed(0)}MB`);
```

### `getTotalDiskCapacity(): number`

Get total internal storage size in bytes.

```typescript
const totalDisk = DeviceInfoModule.getTotalDiskCapacity();
// Example: 128849018880 (120 GB)
console.log(`Total Storage: ${(totalDisk / 1024 / 1024 / 1024).toFixed(0)}GB`);
```

### `getFreeDiskStorage(): number`

Get available free storage space in bytes.

```typescript
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
// Example: 51539607552 (48 GB)
console.log(`Free Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

---

## Battery Information

### `getBatteryLevel(): number`

Get current battery level (0.0 to 1.0).

```typescript
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`Battery: ${(batteryLevel * 100).toFixed(0)}%`);
// Output: "Battery: 75%"
```

### `getPowerState(): PowerState`

Get comprehensive power state information.

```typescript
const powerState = DeviceInfoModule.getPowerState();
console.log(`Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`); // iOS only
```

**PowerState** interface:

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 to 1.0
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS only
}
```

### `isBatteryCharging(): boolean`

Check if battery is currently charging.

```typescript
const isCharging = DeviceInfoModule.isBatteryCharging();
```

### `isLowBatteryLevel(threshold: number): boolean`

Check if battery level is below threshold.

```typescript
const isLowBattery = DeviceInfoModule.isLowBatteryLevel(0.2); // 20%
if (isLowBattery) {
  console.log('Battery is low, please charge');
}
```

---

## Application Metadata

### Synchronous Methods

#### `getVersion(): string`

Get application version string.

```typescript
const version = DeviceInfoModule.getVersion();
// Example: "1.2.3"
```

#### `getBuildNumber(): string`

Get application build number.

```typescript
const buildNumber = DeviceInfoModule.getBuildNumber();
// Example: "42" or "20231025"
```

#### `getBundleId(): string`

Get bundle ID (iOS) or package name (Android).

```typescript
const bundleId = DeviceInfoModule.getBundleId();
// Example: "com.company.app"
```

#### `getApplicationName(): string`

Get application display name.

```typescript
const appName = DeviceInfoModule.getApplicationName();
// Example: "My Awesome App"
```

#### `readableVersion: string`

Get human-readable version string (version.buildNumber).

```typescript
const readableVersion = DeviceInfoModule.readableVersion;
// Example: "1.2.3.42"
```

### Asynchronous Methods

#### `getFirstInstallTime(): Promise<number>`

Get timestamp when app was first installed (ms since epoch).

```typescript
const installTime = await DeviceInfoModule.getFirstInstallTime();
const installDate = new Date(installTime);
console.log(`Installed: ${installDate.toLocaleDateString()}`);
```

**Performance**: ~10-30ms

#### `getLastUpdateTime(): Promise<number>`

Get timestamp of most recent app update (ms since epoch).

```typescript
const updateTime = await DeviceInfoModule.getLastUpdateTime();
const updateDate = new Date(updateTime);
console.log(`Last Updated: ${updateDate.toLocaleDateString()}`);
```

**Performance**: ~10-30ms
**Note**: Returns -1 on iOS

### Synchronous Variants

For better performance when you don't need async:

```typescript
const firstInstallTimeSync = DeviceInfoModule.firstInstallTimeSync;
const lastUpdateTimeSync = DeviceInfoModule.lastUpdateTimeSync; // -1 on iOS
```

---

## Network & Connectivity

All network methods are asynchronous due to system I/O requirements.

### `getIpAddress(): Promise<string>`

Get device local IP address.

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
// Example: "192.168.1.100", "10.0.0.5"
```

**Performance**: ~20-50ms

**Synchronous variant** (with 5-second cache):

```typescript
const ipAddressSync = DeviceInfoModule.ipAddressSync;
```

### `getMacAddress(): Promise<string>`

Get device MAC address.

```typescript
const macAddress = await DeviceInfoModule.getMacAddress();
// iOS: "02:00:00:00:00:00" (hardcoded since iOS 7 for privacy)
// Android: "00:11:22:33:44:55" (actual MAC)
```

**Performance**: ~20-50ms

**Synchronous variant**:

```typescript
const macAddressSync = DeviceInfoModule.macAddressSync;
```

### `getCarrier(): Promise<string>`

Get cellular carrier name.

```typescript
const carrier = await DeviceInfoModule.getCarrier();
// Example: "Verizon", "AT&T", "T-Mobile"
```

**Performance**: ~20-50ms

**Synchronous variant** (with 5-second cache):

```typescript
const carrierSync = DeviceInfoModule.carrierSync;
```

### `isLocationEnabled(): Promise<boolean>`

Check if location services are enabled.

```typescript
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();
```

**Performance**: ~10-30ms

**Synchronous variant**:

```typescript
const isLocationEnabledSync = DeviceInfoModule.isLocationEnabledSync;
```

### `isHeadphonesConnected(): Promise<boolean>`

Check if headphones are connected (wired or Bluetooth).

```typescript
const hasHeadphones = await DeviceInfoModule.isHeadphonesConnected();
```

**Performance**: ~10-30ms

**Synchronous variant**:

```typescript
const isHeadphonesConnectedSync = DeviceInfoModule.isHeadphonesConnectedSync;
```

### `getUserAgent(): Promise<string>`

Get HTTP User-Agent string.

```typescript
const userAgent = await DeviceInfoModule.getUserAgent();
// Example: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ..."
```

**Performance**:
- iOS: 100-500ms (requires WebView initialization, cached after first call)
- Android: sync capable

### `getDeviceName(): string`

Get user-assigned device name.

```typescript
const deviceName = DeviceInfoModule.getDeviceName();
// Example: "John's iPhone", "My Galaxy S21"
```

---

## Platform-Specific Methods

### `getApiLevel(): number`

Get Android API level.

```typescript
const apiLevel = DeviceInfoModule.getApiLevel();
// Android 12 → 31
// Android 13 → 33
// iOS → -1
```

**Platform**: Android only

### `getSupportedAbis(): string[]`

Get supported CPU architectures.

```typescript
const abis = DeviceInfoModule.getSupportedAbis();
// iOS: ["arm64"]
// Android: ["arm64-v8a", "armeabi-v7a"]
```

### `getSupported32BitAbis(): string[]`

Get list of supported 32-bit ABIs.

```typescript
const abis32 = DeviceInfoModule.getSupported32BitAbis();
// iOS: []
// Android API 21+: ["armeabi-v7a", "x86"]
```

**Platform**: Android API 21+, returns `[]` on iOS

### `getSupported64BitAbis(): string[]`

Get list of supported 64-bit ABIs.

```typescript
const abis64 = DeviceInfoModule.getSupported64BitAbis();
// iOS: ["arm64"]
// Android API 21+: ["arm64-v8a", "x86_64"]
```

### `hasGms(): boolean`

Check if Google Mobile Services is available.

```typescript
const hasGms = DeviceInfoModule.hasGms();
// Android with Play Services → true
// Huawei devices without GMS → false
// iOS → false
```

**Platform**: Android only

### `hasHms(): boolean`

Check if Huawei Mobile Services is available.

```typescript
const hasHms = DeviceInfoModule.hasHms();
// Huawei devices → true
// Other Android/iOS → false
```

**Platform**: Android (Huawei devices) only

### `getFontScale(): number`

Get current font scale multiplier.

```typescript
const fontScale = DeviceInfoModule.getFontScale();
// Example: 1.0 (normal), 1.2 (large), 0.85 (small)
```

### `hasSystemFeature(feature: string): boolean`

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

### `getSystemAvailableFeatures(): string[]`

Get list of all available system features.

```typescript
const features = DeviceInfoModule.getSystemAvailableFeatures();
// Android: ["android.hardware.camera", "android.hardware.nfc", ...]
// iOS: []
```

**Platform**: Android only

### `getAvailableLocationProviders(): Record<string, boolean>`

Get available location providers and their status.

```typescript
const providers = DeviceInfoModule.getAvailableLocationProviders();
// { "gps": true, "network": true }
```

### `getMaxMemory(): number`

Get maximum memory available to app (in bytes).

```typescript
const maxMemory = DeviceInfoModule.getMaxMemory();
// Android: max heap size
// iOS: -1
```

**Platform**: Android only

### `getSupportedMediaTypeList(): string[]`

Get list of supported media/codec types.

```typescript
const mediaTypes = DeviceInfoModule.getSupportedMediaTypeList();
// Android: ["video/avc", "audio/mp4a-latm", ...]
// iOS: []
```

**Platform**: Android only

---

## Android Build Information

Synchronous properties providing Android system build information.

**Platform**: Android only (all return "unknown" or default values on iOS)

### Properties

```typescript
const serialNumber = DeviceInfoModule.serialNumber; // Requires READ_PHONE_STATE on Android 8.0+
const androidId = DeviceInfoModule.androidId;
const securityPatch = DeviceInfoModule.securityPatch; // Android API 23+, "YYYY-MM-DD"
const bootloader = DeviceInfoModule.bootloader;
const codename = DeviceInfoModule.codename; // "REL" for release
const device = DeviceInfoModule.device; // Board/platform name
const display = DeviceInfoModule.display; // Build display ID
const fingerprint = DeviceInfoModule.fingerprint; // Unique build identifier
const hardware = DeviceInfoModule.hardware;
const host = DeviceInfoModule.host; // Build host machine
const product = DeviceInfoModule.product;
const tags = DeviceInfoModule.tags; // Comma-separated
const type = DeviceInfoModule.type; // "user", "userdebug", "eng"
const baseOs = DeviceInfoModule.baseOs; // Android API 23+
const previewSdkInt = DeviceInfoModule.previewSdkInt; // Android API 23+, 0 for release
const incremental = DeviceInfoModule.incremental;
const buildId = DeviceInfoModule.buildId;
```

---

## Installation Metadata

### Properties

#### `installerPackageName: string`

Get package name of the app store that installed this app.

```typescript
const installer = DeviceInfoModule.installerPackageName;
// iOS: "com.apple.AppStore", "com.apple.TestFlight"
// Android: "com.android.vending" (Play Store)
```

#### `startupTime: number`

Get device boot time (milliseconds since epoch).

```typescript
const bootTime = DeviceInfoModule.startupTime;
const bootDate = new Date(bootTime);
console.log(`Device booted: ${bootDate.toLocaleString()}`);
```

**Note**: Returns boot time, NOT app startup time

### Methods

#### `getInstallReferrer(): Promise<string>`

Get install referrer information (Android Play Store).

```typescript
const referrer = await DeviceInfoModule.getInstallReferrer();
// Android with Play Services: referrer data
// iOS: "unknown"
```

**Performance**: ~50-200ms (Play Services API call)
**Platform**: Android only (requires Google Play Services)

---

## Advanced Capabilities

### Headphone Detection

#### `isWiredHeadphonesConnected(): boolean`

Check if wired headphones are connected.

```typescript
const hasWiredHeadphones = DeviceInfoModule.isWiredHeadphonesConnected();
```

#### `isBluetoothHeadphonesConnected(): boolean`

Check if Bluetooth headphones are connected.

```typescript
const hasBluetoothHeadphones = DeviceInfoModule.isBluetoothHeadphonesConnected();
```

### Device State

#### `isAirplaneMode(): boolean`

Check if airplane mode is enabled.

```typescript
const isAirplaneMode = DeviceInfoModule.isAirplaneMode();
// Android: true/false
// iOS: false (not available)
```

**Platform**: Android only

#### `isLowRamDevice(): boolean`

Check if device is classified as low RAM device.

```typescript
const isLowRam = DeviceInfoModule.isLowRamDevice();
// Android API 19+: true/false
// iOS: false
```

**Platform**: Android API 19+

#### `isLandscape(): boolean`

Check if device is in landscape orientation.

```typescript
const isLandscape = DeviceInfoModule.isLandscape();
```

---

## iOS-Specific Features

### `isDisplayZoomed(): boolean`

Check if iOS Display Zoom is enabled.

```typescript
const isZoomed = DeviceInfoModule.isDisplayZoomed();
// iOS: true/false based on display zoom setting
// Android: false
```

**Platform**: iOS only

### `getBrightness(): number`

Get current screen brightness level (0.0 to 1.0).

```typescript
const brightness = DeviceInfoModule.getBrightness();
console.log(`Brightness: ${(brightness * 100).toFixed(0)}%`);
// iOS: 0.0 to 1.0
// Android: -1
```

**Platform**: iOS only

### `getDeviceToken(): Promise<string>`

Get Apple DeviceCheck token.

```typescript
try {
  const deviceToken = await DeviceInfoModule.getDeviceToken();
  console.log('DeviceCheck token:', deviceToken);
} catch (error) {
  console.error('DeviceCheck error:', error);
}
```

**Performance**: ~500-2000ms (network request to Apple servers)
**Platform**: iOS 11+ only (throws error on Android)

### `syncUniqueId(): Promise<string>`

Synchronize unique ID to iCloud Keychain.

```typescript
const uniqueId = await DeviceInfoModule.syncUniqueId();
// iOS: Saves IDFV to Keychain (persists across reinstalls)
// Android: Returns getUniqueId() without Keychain sync
```

**Performance**: ~10-50ms (Keychain I/O)
**Platform**: iOS (no-op on Android)

---

## Legacy Compatibility

### `getTotalDiskCapacityOld(): number`

Get total disk capacity using legacy Android API.

```typescript
const totalDiskOld = DeviceInfoModule.getTotalDiskCapacityOld();
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to getTotalDiskCapacity()
```

### `getFreeDiskStorageOld(): number`

Get free disk storage using legacy Android API.

```typescript
const freeDiskOld = DeviceInfoModule.getFreeDiskStorageOld();
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to getFreeDiskStorage()
```

---

## Performance Notes

### Synchronous Methods (<1ms)

All synchronous methods use cached values and return instantly:
- Core device properties
- Device identification
- System resources (memory, disk)
- Battery information
- Application metadata

### Asynchronous Methods

Performance varies by operation type:
- **Fast (10-30ms)**: Install times, location status, headphone detection
- **Medium (20-50ms)**: Network queries (IP, MAC, carrier)
- **Slow (100-500ms)**: UserAgent (iOS WebView init, cached after first call)
- **Very Slow (500-2000ms)**: DeviceCheck token (network request)

### Caching

Network-related synchronous properties use 5-second caches:
- `ipAddressSync`
- `macAddressSync`
- `carrierSync`

This provides fast access while keeping data reasonably fresh.

---

## Platform Compatibility Matrix

| Feature | iOS | Android | Notes |
|---------|-----|---------|-------|
| Core device info | ✅ | ✅ | All platforms |
| Battery info | ✅ | ✅ | Low power mode iOS only |
| System resources | ✅ | ✅ | All platforms |
| Network info | ✅ | ✅ | MAC hardcoded on iOS 7+ |
| Android Build info | ❌ | ✅ | Android only |
| hasNotch/Dynamic Island | ✅ | ❌ | iOS only |
| GMS/HMS detection | ❌ | ✅ | Android only |
| DeviceCheck | ✅ | ❌ | iOS 11+ only |
| Display Zoom | ✅ | ❌ | iOS only |
| Brightness | ✅ | ❌ | iOS only |
| System features | ❌ | ✅ | Android only |
| Media codecs | ❌ | ✅ | Android only |

---

## Next Steps

- View [Type Definitions](/api/types) for TypeScript types
- Check out [Usage Examples](/examples/basic-usage)
- Read the [Migration Guide](/api/migration) for upgrading from `react-native-device-info`
