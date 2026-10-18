---
'react-native-nitro-device-info': patch
---

Read the Android serial number and `ANDROID_ID` only when the app reads `serialNumber` or `androidId`. Reading other build properties, such as `fingerprint`, no longer reads these device identifiers. The returned values do not change.
