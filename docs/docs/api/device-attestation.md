# Device Attestation API

**Server-verifiable, hardware-backed** device attestation via the opt-in package
`react-native-nitro-device-integrity`.

<span class="rp-badge rp-badge--tip">Since v0.1.0</span>

The version badges on this page refer to the integrity package. [v0.1.0 on npm](https://www.npmjs.com/package/react-native-nitro-device-integrity/v/0.1.0) corresponds to [this source](https://github.com/l2hyunwoo/react-native-nitro-device-info/tree/react-native-nitro-device-integrity%400.1.0/packages/react-native-nitro-device-integrity).

Read the [availability badge definitions](/api/#availability-badges). Its pod targets iOS 14+ and its Android module targets API 24+. Dependencies can require higher minimums. There is no web entry point.

- **Android** → [Play Integrity API](https://developer.android.com/google/play/integrity)
- **iOS** → [App Attest (`DCAppAttestService`)](https://developer.apple.com/documentation/devicecheck/dcappattestservice) + [DeviceCheck (`DCDevice`)](https://developer.apple.com/documentation/devicecheck/dcdevice)

This is a **separate, opt-in package** from the core library. Install it only if
you need real attestation; it pulls in Play Integrity / App Attest dependencies
and requires Google Cloud / Apple console setup.

:::tip Attestation vs. local detection
This API **complements** the core [Device Integrity API](./device-integrity).

- **Local detection** ([`isDeviceCompromised()`](./device-integrity)) — instant,
  offline, easily bypassed. A first-line pre-filter.
- **Attestation** (this page) — platform-issued results that your **server verifies**.

Apply your access policy using verified attestation results together with other
risk signals for your service.
:::

## The responsibility boundary

:::warning This library issues tokens. It does not verify them.
Token, attestation, and assertion methods return **opaque** values. These values
alone do not establish device trust. Send them to your backend for verification
before deciding whether to accept a protected action.
:::

| Responsibility | Owner |
|---|---|
| Issue token / attestation / assertion on the device | **this library** |
| Compute `clientDataHash` (SHA-256), assemble client data | your app |
| Send the token to your backend | your app |
| Decrypt / verify signature / interpret the verdict | **your server** |
| Persist the App Attest `keyId` | your app (the library does not persist `keyId`) |
| Google Cloud / Apple console setup | you (developer) |

## Installation

```bash
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

The package sets iOS 14.0+ and Android API 24+ as native minimums. Its Nitro and React Native dependencies can raise these minimums. Play Integrity requires Google Play Services. DeviceCheck exists from iOS 11, but this package does not support installing on iOS 11.

## API Reference

```typescript
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();
```

### Availability

#### `isSupported`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
readonly isSupported: boolean
```

Best-effort check. On Android, `true` when Google Play Services is available
(does **not** guarantee the Play Integrity API is onboarded for your app). On
iOS, `DCAppAttestService.shared.isSupported` — always `false` on the Simulator.

#### `providerType`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
readonly providerType: 'playIntegrity' | 'appAttest' | 'unsupported'
```

Which provider backs this device. Branch your client logic on this before
calling platform-specific methods.

---

### Android — Play Integrity

#### `prepareStandardProvider()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS: rejects</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
prepareStandardProvider(cloudProjectNumber: string): Promise<void>
```

Warms up the Play Integrity **Standard** token provider. Call once per session;
the provider is cached natively. `cloudProjectNumber` is passed as a string to
avoid JS number-precision loss.

Error messages start with `CLOUD_PROJECT_NUMBER_IS_INVALID` for invalid project
numbers or `STANDARD_INTEGRITY_ERROR_<numeric code>` for SDK failures. For
example, a network failure is `STANDARD_INTEGRITY_ERROR_-3`. On iOS:
`UNSUPPORTED_PLATFORM`.

#### `requestIntegrityToken()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS: rejects</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
requestIntegrityToken(requestHash: string): Promise<string>
```

Requests a Standard token. Requires a prior `prepareStandardProvider`. If the
cached provider has expired (`INTEGRITY_TOKEN_PROVIDER_INVALID`), it is
re-prepared once automatically and the request retried.

`requestHash` is a base64 SHA-256 of your request's critical parameters
(max 500 bytes) — **not** a server nonce; the caller computes it. Returns an
opaque, encrypted token string.

#### `requestClassicIntegrityToken()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--warning">iOS: rejects</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
requestClassicIntegrityToken(nonce: string, cloudProjectNumber: string): Promise<string>
```

Play Integrity **Classic** flow (one-off, server-nonce based). Prefer Standard
for frequent checks. `nonce` must be a server-generated, single-use, URL-safe
base64 value of 16–500 bytes.

---

### iOS — App Attest

#### `generateKey()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: rejects</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
generateKey(): Promise<string>
```

Generates an App Attest key pair in the Secure Enclave and returns its `keyId`.

:::warning Persist the keyId yourself
The `keyId` is the only handle to this key — store it (e.g. Keychain). The
library does not persist `keyId`. App Attest keys **do not survive app reinstall**;
regenerate on `DCError.invalidKey`.
:::

#### `attestKey()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: rejects</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
attestKey(keyId: string, clientDataHash: string): Promise<string>
```

Attests a key (**once** per key, per install). Makes a network call to Apple.
`clientDataHash` is base64 of `SHA-256(server challenge)` and must decode to
exactly **32 bytes**. The library does **not** hash for you. Malformed base64
rejects with `INVALID_BASE64`; any other decoded length rejects with
`INVALID_INPUT`, before checking iOS device support. Returns base64 of the
opaque CBOR attestation object.

#### `generateAssertion()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: rejects</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
generateAssertion(keyId: string, clientDataHash: string): Promise<string>
```

Generates an assertion for a subsequent request (offline). Hash client data that
contains a fresh one-time server challenge and the request payload. Pass its
32-byte SHA-256 digest as base64; the same validation as `attestKey` applies. Returns base64
of the opaque CBOR assertion object. Your server checks the issued challenge and
monotonic counter to detect replays.

---

### iOS — DeviceCheck

#### `getDeviceCheckToken()`

<span class="rp-badge rp-badge--tip">Since v0.1.0</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: rejects</span> <span class="rp-badge rp-badge--warning">Web: unavailable</span>

```typescript
getDeviceCheckToken(): Promise<string>
```

Generates an Apple DeviceCheck token (device-level, lighter than App Attest).
Your server queries/updates the device's 2 bits of state via Apple's DeviceCheck
API.

## Errors

Rejections include a code prefix in `Error.message`; there is no separate
JavaScript `error.code` contract.

| Message prefix | Meaning |
|---|---|
| `UNSUPPORTED_PLATFORM` | Platform-specific method called on the wrong platform, or unavailable iOS hardware. |
| `CLOUD_PROJECT_NUMBER_IS_INVALID` | Project number is not a positive signed 64-bit integer string. |
| `PROVIDER_NOT_PREPARED` | Call `prepareStandardProvider` before requesting a Standard token. |
| `STANDARD_INTEGRITY_ERROR_<numeric code>` | Standard SDK failure. Provider invalidation (`-19`) is refreshed and retried once; other failures are returned directly. |
| `CLASSIC_INTEGRITY_ERROR_<numeric code>` | Classic SDK failure; no automatic retry. |
| `INVALID_BASE64` | iOS `clientDataHash` is not valid base64. |
| `INVALID_INPUT` | iOS hash does not decode to 32 bytes, or Apple reports invalid input. |
| `INVALID_KEY`, `SERVER_UNAVAILABLE`, `FEATURE_UNSUPPORTED`, `UNKNOWN_SYSTEM_FAILURE`, `UNKNOWN` | Mapped Apple DeviceCheck / App Attest failures. Other native errors retain their native message. |

Numeric SDK codes are preserved, rather than translated to symbolic names such
as `NETWORK_ERROR`. See the [Standard SDK error codes](https://developer.android.com/google/play/integrity/reference/com/google/android/play/core/integrity/model/StandardIntegrityErrorCode).
Handle the rejection without treating it as a trusted verdict.

## Usage

```typescript
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

if (integrity.providerType === 'playIntegrity') {
  // Android
  await integrity.prepareStandardProvider('123456789012'); // once
  const requestHash = base64Sha256('checkout:item-42');    // your request params
  const token = await integrity.requestIntegrityToken(requestHash);
  await postToYourServer({ token });                        // server verifies
} else if (integrity.providerType === 'appAttest') {
  // iOS
  const keyId = await integrity.generateKey();              // persist this
  const clientDataHash = base64Sha256(serverChallenge);
  const attestation = await integrity.attestKey(keyId, clientDataHash); // once
  await postToYourServer({ keyId, attestation });           // one-time validation
  // ...per request:
  const challenge = await fetchChallengeFromYourServer(); // fresh, one-time
  const clientData = JSON.stringify({ challenge, payload });
  const assertion = await integrity.generateAssertion(keyId, base64Sha256(clientData));
  await postToYourServer({ keyId, assertion, clientData });
}
```

The example assumes your app supplies the hashing and backend helpers. Send the
exact `clientData` string you hashed so the server can verify the same bytes and
compare its embedded challenge with the one it issued for that request.

## Server verification (your responsibility)

This library stops at issuing the token. Your backend verifies it.

### Play Integrity (Android)

Send the token to your server, then call Google's decode endpoint (recommended):

```http
POST https://playintegrity.googleapis.com/v1/{packageName}:decodeIntegrityToken
```

Before checking verdicts, validate `requestDetails`: the expected
`requestPackageName`, a recent `timestampMillis`, and the `requestHash` computed
from the protected request (Standard) or the unused server-issued `nonce`
(Classic). Reject mismatches and expired requests on your backend.

Then apply your policy to the decoded verdict:

- `deviceIntegrity.deviceRecognitionVerdict` containing `MEETS_DEVICE_INTEGRITY`
- `appIntegrity.appRecognitionVerdict === 'PLAY_RECOGNIZED'`
- An empty or absent `deviceRecognitionVerdict` means the device meets none of the verdict criteria. Possible causes include API hooking, system compromise, or an emulator that fails Google's integrity checks.

See [Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts).

### App Attest (iOS)

1. Validate the **attestation** once per key against Apple's App Attest Root CA
   (cert chain, nonce, app-ID hash, counter = 0). Store the public key + counter.
2. For each **assertion**, hash the exact client data received and verify the
   signature with the stored public key. Check that its challenge matches an
   unused server-issued value and that the counter strictly increased.

See [Validating apps that connect to your server](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server).

## Setup requirements

### Android (Play Integrity)

1. Create/select a **Google Cloud** project and enable the Play Integrity API.
2. Link it in **Play Console** → *Play Integrity API*.
3. Pass that **Cloud project number** to `prepareStandardProvider` /
   `requestClassicIntegrityToken`.
4. On your server, set up the Google service account (or response-encryption keys).

### iOS (App Attest / DeviceCheck)

1. Add the **App Attest** capability to your app target (Xcode → Signing &
   Capabilities), which adds the
   `com.apple.developer.devicecheck.appattest-environment` entitlement.
2. Use a **bundle identifier you own** and set your Development Team.
3. For DeviceCheck server queries, create a DeviceCheck `.p8` key in the Apple
   Developer portal.

:::info The library configures none of this
All of the above lives in your developer accounts and app target. The library
cannot set it up — it only issues tokens once your app is configured.
:::

## Limitations

:::warning Attestation limits

- **App Attest is not a jailbreak detector.** It proves a genuine, unmodified
  app on genuine Apple hardware — use it as a *positive* signal.
- **Availability is separate from the verdict.** `isSupported` is `false` on the
  iOS Simulator. Google Play Services availability on Android does not guarantee
  token issuance or any integrity verdict. Check the [Play Integrity verdicts](https://developer.android.com/google/play/integrity/verdicts) on your server.
- **Bypasses exist** (e.g. PlayIntegrityFix). Attestation is one signal in a
  broader anti-abuse strategy, not an absolute guarantee.
- **Network + console configuration required.** Without them, token issuance
  rejects — handle the rejection; don't treat it as "safe".
- **App Attest throttling**: Apple rate-limits `attestKey`. Control call
  frequency in your app; the library adds no automatic retries or timers for App Attest calls.

:::
