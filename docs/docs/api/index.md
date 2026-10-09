# API Reference Overview

Choose the API entry point before copying an example. The root API and `/compat` API have different names and return types.

## Entry points

| Import | Purpose | Example |
| --- | --- | --- |
| `{ DeviceInfoModule }` from `react-native-nitro-device-info` | Native properties and methods | `DeviceInfoModule.model` |
| `DeviceInfo` from `react-native-nitro-device-info/compat` | `react-native-device-info` 15.x-style functions | `DeviceInfo.getModel()` |
| `{ useBatteryLevel }` from `react-native-nitro-device-info` | React hook returning a value | `number \| null` |
| `{ useIsHeadphonesConnected }` from `react-native-nitro-device-info/compat` | Compatibility hook result | `{ loading, result }` |
| `{ DeviceIntegrityModule }` from `react-native-nitro-device-integrity` | Optional attestation package | See [Device Attestation](/api/device-attestation) |

`DeviceInfo` from the root is a TypeScript type. It is not a default runtime object. See [Migration](/api/migration) for compatibility caveats.

## Native API by task

These members belong to `DeviceInfoModule`. Parentheses identify methods; entries without parentheses are properties.

| Task | Example members | Reference |
| --- | --- | --- |
| Identify the model and OS | `deviceId`, `model`, `systemVersion`, `deviceType` | [Core Device Information](/api/device-info#core-device-information-9-apis) |
| Read identifiers | `uniqueId`, `manufacturer`, `deviceName` | [Core Device Information](/api/device-info#core-device-information-9-apis) |
| Check hardware | `isTablet`, `isEmulator`, `isCameraPresent`, `isPinOrFingerprintSet` | [Device Capabilities](/api/device-info#device-capabilities-7-apis) |
| Read display information | `getHasNotch()`, `getHasDynamicIsland()`, `getIsLandscape()`, `getBrightness()` | [Display & Screen](/api/device-info#display--screen-7-apis) |
| Read memory and storage | `totalMemory`, `getUsedMemory()`, `totalDiskCapacity`, `getFreeDiskStorage()` | [System Resources](/api/device-info#system-resources-7-apis) |
| Read battery state | `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | [Battery & Power](/api/device-info#battery--power-4-apis) |
| Read app metadata | `version`, `buildNumber`, `bundleId`, `getFirstInstallTime()` | [Application Metadata](/api/device-info#application-metadata-9-apis) |
| Read network information | `getIpAddress()`, `getIpAddressSync()`, `getMacAddress()` | [Network](/api/device-info#network-6-apis) |
| Read carrier information | `getCarrier()`, `getCarrierSync()`, `mobileCountryCode` | [Carrier Information](/api/device-info#carrier-information-7-apis) |
| Check audio outputs | `isHeadphonesConnected()`, `getIsWiredHeadphonesConnected()` | [Audio Accessories](/api/device-info#audio-accessories-4-apis) |
| Check location services | `isLocationEnabled()`, `getIsLocationEnabled()`, `getAvailableLocationProviders()` | [Location Services](/api/device-info#location-services-3-apis) |
| Check Android features | `apiLevel`, `getHasGms()`, `getHasHms()`, `hasSystemFeature(feature)` | [Android Platform](/api/device-info#android-platform-20-apis) |
| Request Apple DeviceCheck or write an ID to Keychain | `getDeviceToken()`, `syncUniqueId()` | [iOS Platform](/api/device-info#ios-platform-2-apis) |
| Read installation information | `installerPackageName`, `getInstallReferrer()`, `isSideLoadingEnabled()` | [Installation & Distribution](/api/device-info#installation--distribution-3-apis) |

For the remaining members, see the [complete DeviceInfo reference](/api/device-info).

## Call and return contracts

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const model: string = DeviceInfoModule.model;
const battery: number = DeviceInfoModule.getBatteryLevel();

async function readIpAddress(): Promise<string> {
  return await DeviceInfoModule.getIpAddress();
}
```

- **Property**: Read without parentheses. A property can query the OS; `readonly` does not mean that the value is constant.
- **Synchronous method**: Call directly. Synchronous execution does not guarantee a fixed latency.
- **Promise-based method**: Await inside an async function and handle rejection where the API can fail.
- **React hook**: Call inside a React component or custom hook. See [Hooks API](/api/hooks) for loading values and polling intervals.

Memory and storage use bytes. Battery and brightness use fractions from `0` to `1` when available. For example, `getBatteryLevel()` returns `-1` when unavailable, while `useBatteryLevel()` returns `null`.

## Platform and security limits

An unsupported API may return a placeholder or reject. A `false` result can mean that a platform has no implementation. Check the individual API and the [Web Support guide](/guide/web-support).

[Local device integrity](/api/device-integrity) checks in this package are bypassable heuristics. [Device attestation](/api/device-attestation) requires the separate `react-native-nitro-device-integrity` package and backend verification.

## Types and source

Import `DeviceInfo`, `PowerState`, `BatteryState`, `DeviceType`, and `NavigationMode` with `import type`. See [Type Definitions](/api/types).

The current website follows the repository's `main` branch. For an older installed release, check that release's declarations. The signature source is [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts); native implementations define platform behavior.
