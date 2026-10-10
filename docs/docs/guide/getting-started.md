# Getting Started

This guide will help you install and configure `react-native-nitro-device-info` in your React Native project.

## Prerequisites

Before installing, ensure your project meets these requirements:

- **React Native**: Use a version supported by your installed Nitro runtime. The repository examples use React Native 0.85.3; this does not establish a minimum supported version.
- **iOS**: Deployment target 15.1 or higher
- **Android**: minSdkVersion 24 or higher (Android 7.0 Nougat)
- **Node.js**: Follow your React Native toolchain requirements. Repository development uses Node.js 22.

The iOS and Android values above are this library’s native build settings. React Native or Nitro can require a higher minimum.

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

Rebuild the iOS app after installing the pods. Restarting Metro alone does not install native code.

### iOS Privacy Manifest

> **v1.9.0**: Privacy manifest bundling is available from `1.9.0` and is not included in `1.8.3`. See [PR #144](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/144).

The pod packages `ios/PrivacyInfo.xcprivacy` in `NitroDeviceInfo_privacy.bundle`. CocoaPods copies this resource bundle into the app, including when Expo prebuild or EAS Build installs the pod. No privacy-specific config plugin option or manual copy into the app target is needed.

The declarations follow the resource-bundle pattern used by [Expo Device](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-device/ios/ExpoDevice.podspec#L23), with reasons selected for the APIs this library uses:

| API category | Library APIs | Declared reasons |
| --- | --- | --- |
| File timestamp | `getFirstInstallTime()` and `getLastUpdateTime()` read metadata inside the app container. `firstInstallTimeSync` reads metadata on its first access, then returns a cached value; `lastUpdateTimeSync` returns `-1` on iOS. | `C617.1`, also used by [Expo Application](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-application/ios/PrivacyInfo.xcprivacy) |
| Disk space | `totalDiskCapacity`, `getFreeDiskStorage()` and their legacy variants | `E174.1`, `85F4.1`, also used by [Expo FileSystem](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-file-system/ios/PrivacyInfo.xcprivacy) |
| System boot time | `getUptime()` for elapsed time between app events or timers; `startupTime` for converting app-event uptime into an absolute timestamp | `35F9.1` for elapsed time/timers; `8FFB.1` for app-event timestamps |

These reasons have [Apple-defined usage limits](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api). Disk-space data is for visible storage information or storage-dependent app behavior, with restrictions on sending it off-device.

On iOS, the supported uses of `getUptime()` and `startupTime` are limited to the app-event timing purposes in the table. Raw device uptime and boot timestamps must not be displayed or collected as general device information, sent off-device, or used for fingerprinting. Under `35F9.1`, only elapsed time between events within the app may be sent off-device. Under `8FFB.1`, only the resulting absolute timestamps of events within the app may be sent off-device. See the [timing API examples](../api/device-info.md#getuptime-number). Expo Device also declares `35F9.1`, but its declaration does not authorize broader usage of these APIs.

The library declares no collected data or tracking of its own. Your app remains responsible for declarations covering its own data collection, tracking, and other SDKs. Do not use these APIs for device fingerprinting.

After building or archiving the iOS app, verify that the app contains `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`. Existing app-level privacy manifests can remain in place.

### Android Configuration

Gradle autolinking registers the library when you rebuild your Android app. Permission-dependent APIs can still require configuration; see [Expo Setup](/guide/expo-setup).

### Expo apps

Use a development build or EAS Build. Expo Go does not include this native module. Follow [Expo Setup](/guide/expo-setup) for installation, native configuration, and rebuilding.

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
