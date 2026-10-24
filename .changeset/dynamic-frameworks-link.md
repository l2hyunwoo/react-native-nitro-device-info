---
"react-native-nitro-device-info": patch
"@react-native-nitro-device-info/mcp-server": patch
---

iOS: fix builds with `use_frameworks! :linkage => :dynamic`. The podspec now declares the React Native dependencies (`install_modules_dependencies`, `React-jsi`, `React-callinvoker`) like the Nitro template, so `NitroDeviceInfo.framework` links the JSI symbols instead of failing with `Undefined symbols: facebook::jsi::*` in Release. The Nitro spec type is renamed to `NitroDeviceType` so the generated `DeviceType.hpp` no longer shadows react-native-vision-camera's header of the same name; the public `DeviceType` TypeScript type is unchanged. See https://github.com/l2hyunwoo/react-native-nitro-device-info/issues/179
