# react-native-nitro-device-info

Release dates for v1.5.0–v1.8.3 use npm publication timestamps (UTC).

## 1.9.1

### Patch Changes

- c8dd038: Include core package READMEs and package-specific repository metadata in npm archives. Preserve the MCP server's bundled specifications and documentation, including the updated attestation API reference.

## 1.9.0

Changes since v1.8.3:

- Bundle the iOS privacy manifest and document timing API usage limits.
- Implement iOS camera-hardware and configured device-authentication checks.
- Correct Android wired/Bluetooth headphone detection and reuse the cached MAC lookup.
- Preserve unavailable battery readings as `-1`; `useBatteryLevel()` and `useBatteryLevelIsLow()` return `null` for unavailable readings and low-battery checks exclude them.
- Keep web battery readings current, return the unsupported airplane-mode fallback, and fix browser resolution of hooks and `/compat` imports.
- Add packed-package web regression tests and complete Korean documentation.

Upgrade note: iOS previously returned `0` for an unavailable battery. Handle `-1` in core and compat getters before displaying percentages, and handle `null` in `useBatteryLevel()` and `useBatteryLevelIsLow()`. Reinstall pods and rebuild native apps to include native fixes and `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`.

See the [full release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/CHANGELOG.md) for migration details and package scope.

## 1.8.3 - 2026-10-09

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.8.3) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.8.2...v1.8.3)

### Changed

- Extend Apple model lookup with 23 hardware identifiers across iPhone, iPad, Apple TV, and Apple Vision Pro. ([#142](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/142))
- Include screen sizes in iPad Air M2 marketing names. The iPhone Duo mapping follows AppleDB and has not been verified on a physical device. ([#142](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/142))

### Security

- Update and patch dependencies in the library and documentation workspaces. Add security regression checks and migrate documentation to Rspress 2. ([#140](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/140))
- Restrict GitHub Actions workflow token permissions. ([#141](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/141))

## 1.8.2 - 2026-08-09

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.8.2) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.8.1...v1.8.2)

### Fixed

- Ship Android consumer ProGuard rules to preserve native module classes and prevent crashes in release builds with R8 enabled. ([#131](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/131))

## 1.8.1 - 2026-07-05

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.8.1) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.8.0...v1.8.1)

### Fixed

- Return `false` from `getHasNotch()` on iPad, including models with a home indicator. ([#122](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/122))

## 1.8.0 - 2026-06-16

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.8.0) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.7.1...v1.8.0)

### Added

- Add the `/compat` entry with `react-native-device-info`-style async/sync APIs and a migration codemod for imports. ([#111](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/111))
- Add a web entry with browser API fallbacks and SSR-safe defaults. Defer native HybridObject creation until the first native API access. ([#114](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/114))
- Add an Expo config plugin for prebuild and development builds, with an optional `enableSerialNumber` setting for Android's `READ_PHONE_STATE` permission. ([#116](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/116))

### Fixed

- Bind singleton proxy getters and methods to the native HybridObject to preserve Nitro's NativeState. ([#118](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/118))
- Make iOS async carrier, headphone, and location queries use their sync implementations. Resolve immediate MAC, carrier, and headphone results without task scheduling. ([#118](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/118))

## 1.7.1 - 2026-05-30

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.7.1) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.7.0...v1.7.1)

### Added

- Recognize iPhone 17e in the iOS model lookup table. ([#98](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/98))

### Fixed

- Widen the `react-native-nitro-modules` peer dependency from exactly `0.35.0` to `>=0.35.0 <1.0.0`. ([#106](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/106))

## 1.7.0 - 2026-03-06

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.7.0) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.6.1...v1.7.0)

### Changed

- Upgrade the required Nitro runtime and Nitrogen generator from `0.33.9` to `0.35.0`. This release requires exactly `react-native-nitro-modules@0.35.0`. ([#86](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/86))
- Update Android JNI initialization for Nitro 0.35.0. ([#86](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/86))

## 1.6.1 - 2026-02-14

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.6.1) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.6.0...v1.6.1)

### Changed

- Return iOS marketing names such as `iPhone 15 Pro` from `model` instead of generic names such as `iPhone`. Unknown models retain a generic fallback. ([#77](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/77))
- Keep `deviceId` as the hardware identifier, such as `iPhone16,1`. Use it when an identifier is required. ([#77](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/77))

## 1.6.0 - 2026-02-13

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.6.0) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.5.1...v1.6.0)

### Changed

- Raise the iOS deployment target from 13.4 to 15.1 and set the Swift version to 5.9. ([#76](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/76))
- Set Android Java source/target compatibility to 17. Update the default compile/target SDK to 36, Kotlin to 2.1.20, and AGP to 8.13.0. ([#76](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/76))
- Upgrade the required Nitro runtime and Nitrogen generator from `0.31.2` to `0.33.9`. ([#76](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/76))

### Fixed

- Configure the Android NDK version explicitly. Remove duplicate iOS source/dependency declarations and hardcoded Folly settings to fix Xcode build races. ([#74](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/74))

## 1.5.1 - 2026-01-18

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.5.1) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.5.0...v1.5.1)

### Fixed

- Resolve `deviceId` from the simulated device's hardware identifier on iOS simulators instead of returning the host architecture. ([#66](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/66))

## 1.5.0 - 2026-01-04

[Release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/releases/tag/v1.5.0) · [Full diff](https://github.com/l2hyunwoo/react-native-nitro-device-info/compare/v1.4.2...v1.5.0)

### Added

- Add carrier properties: `carrierAllowsVOIP`, `carrierIsoCountryCode`, `mobileCountryCode`, `mobileNetworkCode`, and `mobileNetworkOperator`. ([#56](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/56))

### Changed

- Use `BaseReactPackage` for Android module registration. ([#51](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/51))
- Move the library, MCP server, and examples into a monorepo. Reorganize the API documentation by category. ([#53](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/53), [#57](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/57))

### Fixed

- Add Folly configuration for React Native 0.77–0.79 builds using static frameworks. ([#59](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/59))
