# Expo Setup

If you use Expo with [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/) (`expo prebuild` / dev client), `react-native-nitro-device-info` ships **config plugins** so you can adopt it without editing `ios/` or `android/` by hand.

Use an [Expo development build](https://docs.expo.dev/develop/development-builds/introduction/) or EAS Build. Expo Go does not include this native module. Choose React Native and Nitro versions compatible with your Expo SDK.

## Install

```bash
npx expo install react-native-nitro-device-info react-native-nitro-modules
```

Autolinking registers the native module — for most APIs that is all you need, and you can run `npx expo prebuild` without listing any plugin.

## When you need the config plugin

A few APIs read native capabilities that require a permission or an entitlement. Those are **opt-in**: the plugin only adds them when you ask, because requesting permissions you do not use can get an app rejected from the stores. Add the plugin to the `plugins` array in `app.json` (or `app.config.js`) and enable what you need:

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-nitro-device-info",
        {
          "enableSerialNumber": true
        }
      ]
    ]
  }
}
```

If Expo manages your native directories, regenerate them after changing plugin options. `--clean` deletes and recreates `ios/` and `android/`; preserve manual native changes first:

```bash
npx expo prebuild --clean
```

Rebuild and install the native app after prebuild, using `npx expo run:ios`, `npx expo run:android`, or EAS Build. Restarting the JavaScript server alone does not apply native changes.

### Plugin options

| Option | Default | Effect |
| --- | --- | --- |
| `enableSerialNumber` | `false` | Declares Android `READ_PHONE_STATE`. Your app must request runtime permission separately. Android 10+ restricts serial access further, so ordinary apps generally receive `"unknown"` even after granting it. |

The plugin only declares the permission; it does not request it at runtime or bypass [Android serial-number restrictions](https://developer.android.com/reference/android/os/Build#getSerial()). The library caches `serialNumber` on first access, so request any required permission before reading it.

### What is NOT injected (by design)

- **`getInstallReferrer()`, `getHasGms()`** — the Play Install Referrer and Google Play Services dependencies are bundled in the library's Gradle build, so the consuming app needs no manifest or Gradle change.
- **Location and carrier APIs** — `getIsLocationEnabled()` and the carrier getters read global system state without requesting authorization, so they need no `Info.plist` usage-description keys.
- **`isSideLoadingEnabled()`** — see below.

## `isSideLoadingEnabled()` requires manual setup

`isSideLoadingEnabled()` calls `canRequestPackageInstalls()`, which only returns `true` when the app declares the Android `REQUEST_INSTALL_PACKAGES` permission. The plugin does **not** add this permission, because Google Play classifies it as a restricted permission: it is only an acceptable use when your app actually installs packages with user-initiated flows. Declaring it just to query sideloading status can fail Play review.

If your app genuinely qualifies, add the permission yourself with the [`expo-build-properties`](https://docs.expo.dev/versions/latest/sdk/build-properties/) plugin or a small custom plugin, and be ready to justify it in the Play Console permissions declaration. Without the permission, `isSideLoadingEnabled()` simply returns `false`.

## Device attestation (App Attest / Play Integrity)

The optional `react-native-nitro-device-integrity` package has its own config plugin.

```bash
npx expo install react-native-nitro-device-integrity
```

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-nitro-device-integrity",
        {
          "appAttest": true
        }
      ]
    ]
  }
}
```

| Option | Default | Effect |
| --- | --- | --- |
| `appAttest` | `false` | Adds the iOS `com.apple.developer.devicecheck.appattest-environment` entitlement (value `development`) so `DCAppAttestService` works. |

The entitlement value is always written as `development`. iOS ignores it on builds distributed through TestFlight or the App Store and uses the production environment automatically, so a single value is correct for both.

:::warning App Attest also needs a portal capability
The plugin writes the entitlement, but it cannot enable the App Attest capability on your App ID. Turn on **App Attest** for your App ID in the Apple Developer portal (or let EAS / Xcode automatic signing manage it). Without that capability the build fails to sign (error `0xE8008016`).
:::

Play Integrity (Android) and DeviceCheck (iOS) need no entitlement or permission — only a runtime `cloudProjectNumber` for Play Integrity — so they require no config plugin.

## Verifying the result

After `npx expo prebuild --clean`, you can confirm the injected settings:

- `android/app/src/main/AndroidManifest.xml` contains `<uses-permission android:name="android.permission.READ_PHONE_STATE" />` when `enableSerialNumber` is on.
- `ios/<app>/<app>.entitlements` contains the `appattest-environment` key when `appAttest` is on.

Running prebuild again does not duplicate these entries — the plugins are idempotent.
