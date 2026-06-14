# Web Support

`react-native-nitro-device-info` is built on [Nitro](https://nitro.margelo.com/),
a JSI/native technology. A browser has no native module, so the goal on web is
narrower than on native: **the package must be import-safe and return honest
fallback values** — not reproduce every device API.

This lets teams whose monorepo targets both native and web (react-native-web,
Next.js SSR) depend on the package without their web build crashing.

## How it works

The package ships a pure-JS web implementation (`DeviceInfo.web.ts`) that
satisfies the full `DeviceInfo` interface. Your bundler selects it
automatically — there is **no separate package to install and no import path to
change**.

```ts
// Same import on every platform.
import { DeviceInfoModule, createDeviceInfo } from 'react-native-nitro-device-info';
```

Selection happens through two complementary mechanisms, so it works across the
common web toolchains:

- **Metro / react-native-web (Expo web):** Metro resolves the `.web.ts` platform
  extension (`index.web.ts` is tried before `index.ts`) and also asserts the
  `browser` export condition for the web platform.
- **webpack / Next.js:** the package's `package.json` `exports` map declares a
  `"browser"` condition that points at the web build, which webpack honors for
  `target: 'web'`.

On the server during SSR, the native entry is also import-safe: the native
HybridObject is created **lazily** (on first property access, not at module
load), so merely importing the package never throws — and during server render no
property is read, so the native binding is never touched.

## What is real vs. fallback

The fallback returns a real value where a browser API can answer, and otherwise
the same neutral constants the native side uses for an unsupported platform
(`"unknown"` / `-1` / `false` / `[]`). **Values are never fabricated to look
real.**

### Derived from a browser API (when available)

| Member | Source |
| --- | --- |
| `systemName` | parsed from `navigator.userAgent` (`"Windows"`/`"macOS"`/`"iOS"`/`"Android"`/`"Linux"`, else `"web"`) |
| `systemLanguage` | `navigator.language` |
| `brand`, `manufacturer` | `navigator.vendor` |
| `totalMemory` | `navigator.deviceMemory` × 1024³ (coarse, spec-bucketed; `-1` if unsupported) |
| `getIsLandscape()` | `screen.width > screen.height` |
| `getUserAgent()` | `navigator.userAgent` |
| `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | Battery Status API (`navigator.getBattery()`), read once and cached; `-1` / `"unknown"` if absent or denied |
| `getIsAirplaneMode()` | inferred from `navigator.onLine` (best effort) |

When the underlying global is missing (an older browser, or a server with no
`navigator`/`screen`), each of these degrades to the fallback constant rather
than throwing.

### Always a fallback constant on web

- All Android `Build.*` fields (`androidId`, `serialNumber`, `fingerprint`,
  `board`, `bootloader`, `apiLevel`, `securityPatch`, …)
- Carrier / MCC / MNC information
- Disk capacity and used-memory figures
- Headphone, location, notch, and Dynamic Island checks
- Integrity checks — `isDeviceCompromised()` returns `false`
- App metadata (`version`, `buildNumber`, `bundleId`, `applicationName`, …)
- Windows-only fields (`isMouseConnected`, `hostNames`, …)

### Promise methods

Methods that return a `Promise` keep their signature and **resolve** the fallback
— they do not reject — so existing `await` call sites keep working:

```ts
await DeviceInfoModule.getIpAddress();          // "unknown"
await DeviceInfoModule.verifyDeviceIntegrity(); // false
```

The one exception is `getDeviceToken()`, which **rejects** on web. It is Apple
DeviceCheck, which has no web equivalent — this mirrors its documented behavior on
Android.

## SSR notes

Every browser global is read through a `typeof` guard, and the native singleton
is lazy, so importing the package and reading any member on a server never
throws. Browser-derived values (battery, screen, `navigator`) naturally fall back
to constants on the server, then reflect real values once the app runs in the
browser.
