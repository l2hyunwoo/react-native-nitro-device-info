# react-native-nitro-device-integrity

Opt-in, hardware-backed **device attestation** for React Native, built on
[Nitro Modules](https://nitro.margelo.com/). A companion to
[`react-native-nitro-device-info`](https://github.com/l2hyunwoo/react-native-nitro-device-info).

- **Android** → [Play Integrity API](https://developer.android.com/google/play/integrity)
- **iOS** → [App Attest (`DCAppAttestService`)](https://developer.apple.com/documentation/devicecheck/dcappattestservice) + [DeviceCheck (`DCDevice`)](https://developer.apple.com/documentation/devicecheck/dcdevice)

> **This package issues attestation tokens. It does not verify them.**
> Every method returns an opaque token that **you must send to your own backend
> for verification.** The library never decides whether a device is "safe" —
> that decision belongs to your server. See [Responsibility boundary](#responsibility-boundary).

## Why a separate package?

The core `react-native-nitro-device-info` ships local-only integrity checks
(`isDeviceCompromised()`), which — as its own docs admit — can be bypassed
(Magisk + Shamiko, RootHide, etc.). Real, server-verifiable attestation requires
extra native dependencies (`com.google.android.play:integrity`), platform
capabilities (App Attest entitlement), and Google/Apple console setup. Keeping it
in a separate, opt-in package isolates that weight and configuration burden from
the core.

| | Core `isDeviceCompromised()` | This package |
|---|---|---|
| Type | Local heuristics | Hardware-backed, OS-vendor attestation |
| Network | Offline | Required |
| Trust | First-line, easily bypassed | Server-verified, strong |
| Use as | Fast pre-check | Authoritative gate (verified on your server) |

They are **complementary**: use the core check as an instant offline pre-filter,
and this package's tokens as the authoritative, server-verified signal.

## Installation

```sh
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

Requires `react-native-nitro-modules` (peer dependency). iOS 14.0+ (App Attest)
/ 11.0+ (DeviceCheck), Android API 23+ with Google Play Services.

## Responsibility boundary

| Responsibility | Owner |
|---|---|
| Issue token / attestation / assertion on the device | **This library** |
| Compute `clientDataHash` (SHA-256) and assemble client data | **You (app)** |
| Send the token to your backend | **You (app)** |
| Decrypt / verify signature / interpret the verdict | **Your server** |
| Persist the App Attest `keyId` | **You (app)** — library is stateless |
| Google Cloud / Apple console setup | **You (developer)** |

## Usage

```ts
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

if (integrity.providerType === 'playIntegrity') {
  // --- Android: Play Integrity (Standard) ---
  await integrity.prepareStandardProvider('123456789012'); // your Cloud project number, once
  const requestHash = '<base64 SHA-256 of your request params>';
  const token = await integrity.requestIntegrityToken(requestHash);
  // POST `token` to your server → Google :decodeIntegrityToken
} else if (integrity.providerType === 'appAttest') {
  // --- iOS: App Attest ---
  const keyId = await integrity.generateKey();          // persist this yourself
  const clientDataHash = '<base64 SHA-256 of your server challenge>';
  const attestation = await integrity.attestKey(keyId, clientDataHash); // once
  // POST { keyId, attestation } to your server for one-time validation
  const assertion = await integrity.generateAssertion(keyId, clientDataHash); // per request
}
```

### `clientDataHash` (iOS)

App Attest expects an **already-hashed** 32-byte value. You compute
`SHA-256(challenge ‖ yourClientData)` and pass it base64-encoded. This library
deliberately does **not** hash for you — how you assemble client data must match
what your server expects.

## Server verification (your responsibility)

This library stops at issuing the token. Your backend must verify it.

### Play Integrity (Android)

Send the token to your server, then call Google's decode endpoint (recommended):

```
POST https://playintegrity.googleapis.com/v1/{packageName}:decodeIntegrityToken
```

Interpret the verdict: `deviceIntegrity.deviceRecognitionVerdict` containing
`MEETS_DEVICE_INTEGRITY`, `appIntegrity.appRecognitionVerdict === PLAY_RECOGNIZED`,
etc. An **empty** `deviceRecognitionVerdict` is a signal of a compromised/emulated
device. See [Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts).

### App Attest (iOS)

Validate the attestation **once** per key against Apple's App Attest Root CA
(cert chain, nonce, app-ID hash, counter = 0), store the public key + counter,
then verify each **assertion's** signature and monotonic counter. See
[Validating apps that connect to your server](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server).

## Setup requirements

### Android (Play Integrity)

1. Create / select a **Google Cloud** project, enable the Play Integrity API.
2. Link the Cloud project in **Play Console** → *Play Integrity API*.
3. Pass your **Cloud project number** to `prepareStandardProvider` /
   `requestClassicIntegrityToken`.
4. On your server, set up the Google service account (or response-encryption keys).

### iOS (App Attest / DeviceCheck)

1. Add the **App Attest** capability to your app target (Xcode → Signing &
   Capabilities). This adds the
   `com.apple.developer.devicecheck.appattest-environment` entitlement
   (`development` / `production`).
2. For DeviceCheck server queries, create a DeviceCheck `.p8` key in the Apple
   Developer portal.

> The library does not (and cannot) perform any of this setup — it is configured
> on your developer accounts and app target.

## Honest limitations

- **App Attest is not a jailbreak detector.** It proves a genuine, unmodified app
  instance on genuine Apple hardware — use it as a *positive* signal, not as
  rooting/jailbreak detection.
- **Simulators / emulators**: `isSupported` is `false` on the iOS simulator; Play
  Integrity returns weak/empty verdicts on emulators.
- **Rooted devices**: Play Integrity still returns a token, but with an empty
  `deviceRecognitionVerdict` — your server must treat that as a failure.
- **Bypasses exist** (e.g. PlayIntegrityFix). Attestation is not absolute; use it
  as one signal in a broader anti-abuse strategy.
- **Network required.** Without Google Cloud / Apple configuration, token
  issuance fails — handle the rejection, don't treat it as "safe".
- **App Attest throttling**: Apple rate-limits `attestKey`. Control call frequency
  in your app; the library adds no retry/timer (it stays stateless).

## License

MIT
