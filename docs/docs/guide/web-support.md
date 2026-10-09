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

If a server bundler selects the native entry, its HybridObject is created lazily on first property access. Importing that entry does not create a HybridObject. Reading `DeviceInfoModule.model`, calling a method, or calling `createDeviceInfo()` still requires native bindings and can throw on the server.

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
| `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | Battery Status API (`navigator.getBattery()`), requested once; getters read the live BatteryManager; `-1` / `"unknown"` if absent or denied |
| `getIsAirplaneMode()` | `false` (unsupported: browsers cannot determine airplane mode) |

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

The web implementation guards browser globals and can return fallback values during server rendering. This applies only when your server bundle selects the web implementation.

If the server selects the native entry, keep device reads in client-only code, such as a `useEffect`. React renders component bodies on the server; a property read in the component body can therefore trigger native initialization. Check your framework’s server resolver before reading device values during SSR.

Server and browser values can differ. Render a stable loading state first if browser-derived values would otherwise cause a hydration mismatch.
