# Integrity Demo App

Demonstration app for [`react-native-nitro-device-integrity`](../../packages/react-native-nitro-device-integrity) —
opt-in, hardware-backed device attestation (Play Integrity on Android, App
Attest + DeviceCheck on iOS).

The app **issues** attestation tokens and shows them on screen (truncated). It
does **not** verify them — verification is your server's job. See the
[package README](../../packages/react-native-nitro-device-integrity/README.md)
for the server-side verification guide.

## What it shows

- `providerType` / `isSupported` for the current device.
- **Android**: enter your Cloud project number → *Prepare provider* →
  *Request integrity token* (Play Integrity Standard).
- **iOS**: *Generate key* → *Attest key* → *Generate assertion* (App Attest),
  plus a *DeviceCheck token* button.
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
  *Signing & Capabilities*.
- Set your **Development Team** and a **bundle identifier you own** (App Attest
  does not work with a placeholder bundle ID).
- The **App Attest** capability is pre-wired via
  `NitroDeviceIntegrityDemo.entitlements`
  (`com.apple.developer.devicecheck.appattest-environment = development`).
- Run on a **real device** — App Attest is unsupported in the Simulator.

### Android (Play Integrity)

- Create/select a **Google Cloud** project and enable the Play Integrity API.
- Link it in **Play Console** → *Play Integrity API*.
- Enter that **Cloud project number** in the app's input field.
- Run on a device with **Google Play Services** (most physical devices;
  emulators with Play Store).

## Not included (by design)

Server-side token verification. This demo stops at issuing the token; your
backend decrypts/validates it. See the package README for how.
