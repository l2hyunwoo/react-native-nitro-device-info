---
'react-native-nitro-device-info': patch
'react-native-nitro-device-integrity': patch
---

Rebuild the native bindings with Nitro 0.37.1 and verify support for React Native 0.88. The `react-native-nitro-modules` requirement stays at `>=0.35.0 <1.0.0`. Android builds also no longer fail when the host app enables AGP 9 built-in Kotlin.
