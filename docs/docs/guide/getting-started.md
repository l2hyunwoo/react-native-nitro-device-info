# Getting Started

This guide will help you install and configure `react-native-nitro-device-info` in your React Native project.

## Prerequisites

Before installing, ensure your project meets these requirements:

- **React Native**: 0.68 or higher (New Architecture support)
- **iOS**: Deployment target 13.4 or higher
- **Android**: minSdkVersion 24 or higher (Android 7.0 Nougat)
- **Node.js**: 22.11.0 or higher

## Installation

Install the library and its peer dependency using your preferred package manager:

```bash
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **Important**: `react-native-nitro-modules` >=0.35.0 <1.0.0 is required as a peer dependency for JSI bindings.

## Platform Setup

### iOS Configuration

After installation, install the CocoaPods dependencies:

```sh
cd ios && pod install && cd ..
```

That's it! The iOS setup is complete.

### iOS Privacy Manifest

The pod packages `ios/PrivacyInfo.xcprivacy` in `NitroDeviceInfo_privacy.bundle`. CocoaPods copies this resource bundle into the app, including when Expo prebuild or EAS Build installs the pod. No privacy-specific config plugin option or manual copy into the app target is needed.

The declarations follow the resource-bundle pattern used by [Expo Device](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-device/ios/ExpoDevice.podspec#L23), with reasons selected for the APIs this library uses:

| API category | Library APIs | Declared reasons |
| --- | --- | --- |
| File timestamp | `getFirstInstallTime()`, `getLastUpdateTime()` and their sync properties, which read metadata inside the app container | `C617.1`, also used by [Expo Application](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-application/ios/PrivacyInfo.xcprivacy) |
| Disk space | `totalDiskCapacity`, `getFreeDiskStorage()` and their legacy variants | `E174.1`, `85F4.1`, also used by [Expo FileSystem](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-file-system/ios/PrivacyInfo.xcprivacy) |
| System boot time | `getUptime()`, `startupTime` | `35F9.1`, also used by [Expo Device](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-device/ios/PrivacyInfo.xcprivacy) |

These reasons have [Apple-defined usage limits](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api). Disk-space data is for visible storage information or storage-dependent app behavior, with restrictions on sending it off-device. `35F9.1` covers elapsed time between app events and timers; it does not authorize sending raw uptime or boot timestamps off-device. Expo Device uses the same reason for its uptime getter, but [notes that the reason is not an exact match](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-device/ios/DeviceModule.swift#L69-L72). Review how your app uses these values; the declaration alone does not establish that every use is permitted.

The library declares no collected data or tracking of its own. Your app remains responsible for declarations covering its own data collection, tracking, and other SDKs. Do not use these APIs for device fingerprinting.

After building or archiving the iOS app, verify that the app contains `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`. Existing app-level privacy manifests can remain in place.

### Android Configuration

No additional configuration needed! Gradle auto-linking handles everything automatically.

The library will be automatically linked when you build your Android app.

## Verify Installation

To verify the installation was successful, add this code to your app:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

console.log('Device ID:', DeviceInfoModule.deviceId);
console.log('Brand:', DeviceInfoModule.brand);
console.log('System Version:', DeviceInfoModule.systemVersion);
```

If you see device information logged to the console, the installation was successful!

## Next Steps

Now that you have the library installed, check out the [Quick Start](/guide/quick-start) guide to learn how to use it in your app.

You can also:
- Explore the [API Reference](/api/) for all available methods
- View [Examples](/examples/basic-usage) for common use cases
- Check out the [Migration Guide](/api/migration) if coming from `react-native-device-info`
