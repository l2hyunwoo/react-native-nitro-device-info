# react-native-nitro-device-info

## 1.9.0 (Unreleased)

Changes since v1.8.3:

- Bundle the iOS privacy manifest and document timing API usage limits.
- Implement iOS camera-hardware and configured device-authentication checks.
- Correct Android wired/Bluetooth headphone detection and reuse the cached MAC lookup.
- Preserve unavailable battery readings as `-1`; `useBatteryLevel()` and `useBatteryLevelIsLow()` return `null` for unavailable readings and low-battery checks exclude them.
- Keep web battery readings current, return the unsupported airplane-mode fallback, and fix browser resolution of hooks and `/compat` imports.
- Add packed-package web regression tests and complete Korean documentation.

Upgrade note: iOS previously returned `0` for an unavailable battery. Handle `-1` in core and compat getters before displaying percentages, and handle `null` in `useBatteryLevel()` and `useBatteryLevelIsLow()`. Reinstall pods and rebuild native apps to include native fixes and `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`.

See the [full release notes](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/CHANGELOG.md) for migration details and package scope.

## 1.4.3

### Patch Changes

- [#56](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/56) [`53a3897`](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/53a38973b3cfad2ef5fd1da1d712ec2eb37cad69) Thanks [@l2hyunwoo](https://github.com/l2hyunwoo)! - feat: add carrier informations

- [#57](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/57) [`8c28998`](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/8c28998f743822ef6440b44508e7d4524e4b599f) Thanks [@l2hyunwoo](https://github.com/l2hyunwoo)! - docs: reorganize categories

- [#53](https://github.com/l2hyunwoo/react-native-nitro-device-info/pull/53) [`2766f17`](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/2766f178e519173e8dbf0bfd5696a268ff8f2237) Thanks [@l2hyunwoo](https://github.com/l2hyunwoo)! - architecture: apply monorepo
