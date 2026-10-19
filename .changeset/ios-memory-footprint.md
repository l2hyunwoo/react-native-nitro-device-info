---
"react-native-nitro-device-info": patch
"@react-native-nitro-device-info/mcp-server": patch
---

iOS: `getUsedMemory()` now returns `phys_footprint` (what jetsam and Xcode's memory gauge use) instead of `resident_size`, and `maxMemory` returns the app's jetsam limit (`getUsedMemory()` + `os_proc_available_memory()`) instead of `-1`. `maxMemory` stays `-1` when `os_proc_available_memory()` returns 0: no limit applies (e.g. the Simulator) or the app has already exceeded its limit.
