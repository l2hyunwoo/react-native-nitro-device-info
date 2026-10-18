---
'react-native-nitro-device-info': patch
'react-native-nitro-device-integrity': patch
---

Skip applying the `kotlin-android` plugin when the host app enables AGP 9 built-in Kotlin, so Android builds no longer fail on that setup.
