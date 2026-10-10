# Integrity Demo App

[English](README.md) | [한국어](README-ko.md)

Demonstration app for [`react-native-nitro-device-integrity`](../../packages/react-native-nitro-device-integrity) —
opt-in, hardware-backed device attestation (Play Integrity on Android, App
Attest + DeviceCheck on iOS).

The app **issues** attestation tokens and shows them on screen (truncated). It
does **not** verify them — verification is your server's job. See the
[API documentation](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/device-attestation#server-verification-your-responsibility)
for the server-side verification guide.

## What it shows

- `providerType` / `isSupported` for the current device.
- **Android**: enter your Cloud project number → _Prepare provider_ →
  _Request integrity token_ (Play Integrity Standard).
- **iOS**: _Generate key_ → _Attest key_ → _Generate assertion_ (App Attest),
  plus a _DeviceCheck token_ button.
- Graceful errors when the device/setup is unsupported (e.g. iOS Simulator).

`clientDataHash` / `requestHash` are computed in-app with a self-contained
SHA-256 (`src/utils/hash.ts`) — no native crypto dependency.

## Running the app

From the repository root:

```bash
yarn integrity-demo ios      # iOS (real device required for App Attest)
yarn integrity-demo android  # Android (needs Google Play Services)
```

From this directory:

```bash
yarn pod    # iOS: pod install
yarn ios
yarn android
```

After changing the package's `.nitro.ts` API, run `yarn nitrogen:integrity`
from the repo root.

## Setup required for real tokens

Attestation only returns real tokens once the provider is configured. Without
this, the buttons reject with an explanatory error (which is itself a useful
thing to see).

### iOS (App Attest)

- Open `ios/NitroDeviceIntegrityDemo.xcworkspace`, select the target →
  _Signing & Capabilities_.
- Set your **Development Team** and a **bundle identifier you own** (App Attest
  does not work with a placeholder bundle ID).
- The **App Attest** capability is pre-wired via
  `NitroDeviceIntegrityDemo.entitlements`
  (`com.apple.developer.devicecheck.appattest-environment = development`).
- Run on a **real device** — App Attest is unsupported in the Simulator.

### Android (Play Integrity)

- Create/select a **Google Cloud** project and enable the Play Integrity API.
- Link it in **Play Console** → _Play Integrity API_.
- Enter that **Cloud project number** in the app's input field.
- Run on a device with **Google Play Services** (most physical devices;
  emulators with Play Store).

## Device tests

Install workspace dependencies and prepare the integrity package as described in [CONTRIBUTING](../../CONTRIBUTING.md#integrity-tests).

1. Edit [rn-harness.config.mjs](rn-harness.config.mjs) to select an available simulator or connected Android device. The configured iOS runtime must be installed. You can override its version with `INTEGRITY_IOS_VERSION`.
2. Install a **Debug** demo app on that same device. For iOS, replace `<configured simulator name>` with the name from the config:

   ```sh
   yarn integrity-demo ios --mode Debug --simulator "<configured simulator name>" --no-packager
   ```

   For Android, select the connected device in the config and install the Debug app with `yarn integrity-demo android --no-packager`.

3. From the repository root, run the harness for that platform:

   ```sh
   yarn integrity-demo test:e2e:ios
   # Or, with the configured Android device connected:
   yarn integrity-demo test:e2e:android
   ```

The harness starts Metro. A Release app uses bundled JavaScript and cannot load these harness tests. Tests cover availability, invalid hash inputs, and native promise rejections across the JavaScript bridge. Simulator results confirm client behavior; real-device attestation and backend verification need separate checks.

## Production integration

The demo uses fixed sample challenges and does not verify tokens. Production apps must get fresh, one-time challenges from their server and verify the issued results before accepting protected actions. See the [attestation API and server verification guide](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/device-attestation#server-verification-your-responsibility).
