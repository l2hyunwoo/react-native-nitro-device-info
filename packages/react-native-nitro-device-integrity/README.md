# react-native-nitro-device-integrity

[English](README.md) | [한국어](README-ko.md)

Device attestation for React Native, built on [Nitro Modules](https://nitro.margelo.com/).

| Platform | APIs                                |
| -------- | ----------------------------------- |
| Android  | Play Integrity Standard and Classic |
| iOS      | App Attest and DeviceCheck          |

This optional package complements [`react-native-nitro-device-info`](https://github.com/l2hyunwoo/react-native-nitro-device-info).
Install it when your app needs tokens that your backend can verify. It adds native dependencies and platform setup separately from the core device information library.

> **Your backend must verify the issued tokens, attestations, and assertions before accepting a protected action.** The library provides the native APIs; your server decides whether to trust a request.

## Installation

```sh
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

Rebuild your native app after installation. The package targets iOS 14.0+ and Android API 24+; React Native and Nitro dependencies can require newer versions. There is no web entry point.

- **Android:** Google Play Services and a Google Cloud project configured for Play Integrity are required. Link the project in Play Console and use its project number.
- **iOS:** configure your app's signing and App Attest capability. DeviceCheck server queries need a DeviceCheck key from your Apple Developer account.
- **Expo:** see the [Expo setup guide](https://l2hyunwoo.github.io/react-native-nitro-device-info/guide/expo-setup) for the optional config plugin.

See [platform setup](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/device-attestation#setup-requirements) for details.

## Usage

```ts
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

console.log(integrity.providerType); // 'playIntegrity', 'appAttest', or 'unsupported'
console.log(integrity.isSupported);
```

`isSupported` checks device availability. It does not confirm that your developer accounts are configured or that server verification will succeed.

| Flow                    | App calls                                                                           | Backend responsibility                                        |
| ----------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Play Integrity Standard | `prepareStandardProvider(projectNumber)`, then `requestIntegrityToken(requestHash)` | Decode the token and validate the request and verdict         |
| Play Integrity Classic  | `requestClassicIntegrityToken(nonce, projectNumber)`                                | Decode the token and validate the issued nonce and verdict    |
| App Attest registration | `generateKey()`, then `attestKey(keyId, clientDataHash)`                            | Validate the attestation and store the public key             |
| App Attest requests     | `generateAssertion(keyId, clientDataHash)`                                          | Verify the signature, fresh challenge, and increasing counter |
| DeviceCheck             | `getDeviceCheckToken()`                                                             | Use Apple's DeviceCheck server API                            |

Your app computes the request hashes and sends the results to your backend. For App Attest, `clientDataHash` must be a base64-encoded, 32-byte SHA-256 digest. Use a fresh server challenge and include the request payload in assertion client data. Persist the `keyId` in your app; the library does not store it for you.

Native failures reject the returned promise. Error identifiers are prefixes in `Error.message`. See the [API reference](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/device-attestation) for complete examples, input requirements, error prefixes, and server verification guidance.

## Limitations

- App Attest is unavailable on the iOS simulator. Use a supported physical device for attestation.
- A token alone does not establish device trust. Your backend must check the provider's response and apply your access policy.
- Handle unsupported devices, network failures, and platform quotas. App Attest is not a jailbreak detector, and attestation is one input to your abuse prevention policy.

## Examples and contributing

The [Integrity Demo](https://github.com/l2hyunwoo/react-native-nitro-device-info/tree/main/example/integrity-demo) demonstrates the client flows. For source setup and tests, see [CONTRIBUTING](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/CONTRIBUTING.md).

## License

MIT
