/**
 * Nitro Device Integrity Module - TypeScript Interface Contract
 *
 * Opt-in subpackage providing REAL hardware-backed device attestation:
 * - Android: Play Integrity API (Google-signed integrity verdict token)
 * - iOS: App Attest (DCAppAttestService) + DeviceCheck (DCDevice)
 *
 * Processed by Nitrogen to generate native bindings.
 *
 * ## Responsibility boundary (READ THIS)
 *
 * This library is a **token-issuing client only**. It produces opaque tokens
 * on the device. It does NOT, and cannot, decrypt them or interpret a verdict.
 *
 * Every method returns an opaque, encrypted/signed token string. The caller
 * MUST forward that token to their own backend, which performs the actual
 * verification:
 * - Play Integrity: call Google `:decodeIntegrityToken` (or self-managed keys)
 * - App Attest: validate Apple's cert chain, nonce, counter, and app-ID hash
 *
 * The library never returns a boolean "is this device safe?" judgement — that
 * decision belongs to your server.
 *
 * @platform ios 14.0+ (App Attest), 11.0+ (DeviceCheck)
 * @platform android API 23+ (Play Integrity)
 */

import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Which attestation provider backs the current device.
 *
 * - `playIntegrity` — Android with Google Play Services (Play Integrity API)
 * - `appAttest` — iOS 14.0+ with Secure Enclave (DCAppAttestService)
 * - `unsupported` — simulator/emulator, no Play Services, or iOS < 14
 */
export type IntegrityProviderType = 'playIntegrity' | 'appAttest' | 'unsupported';

/**
 * Device attestation token issuer.
 *
 * @example
 * ```typescript
 * import { createDeviceIntegrity } from 'react-native-nitro-device-integrity'
 *
 * const integrity = createDeviceIntegrity()
 *
 * if (integrity.providerType === 'playIntegrity') {
 *   await integrity.prepareStandardProvider(myCloudProjectNumber) // once
 *   const token = await integrity.requestIntegrityToken(requestHashB64)
 *   // POST `token` to your server -> Google :decodeIntegrityToken
 * } else if (integrity.providerType === 'appAttest') {
 *   const keyId = await integrity.generateKey()            // store this yourself
 *   const attestation = await integrity.attestKey(keyId, clientDataHashB64) // once
 *   // POST { keyId, attestation } to your server for one-time validation
 *   const assertion = await integrity.generateAssertion(keyId, clientDataHashB64) // per request
 * }
 * ```
 */
export interface DeviceIntegrity
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  // ============================================
  // AVAILABILITY
  // ============================================

  /**
   * Best-effort synchronous check of attestation availability.
   *
   * - **Android:** `true` when Google Play Services is available. This does
   *   NOT guarantee the Play Integrity API is onboarded/enabled for your app —
   *   real availability is only known once a token request succeeds.
   * - **iOS:** `DCAppAttestService.shared.isSupported` (Secure Enclave + iOS
   *   14.0+). Always `false` on the simulator.
   *
   * @returns `true` if an attestation provider is likely usable.
   */
  readonly isSupported: boolean;

  /**
   * Which provider backs this device. Use to branch your client logic before
   * calling platform-specific methods.
   */
  readonly providerType: IntegrityProviderType;

  // ============================================
  // ANDROID — PLAY INTEGRITY
  // ============================================

  /**
   * Warm up the Play Integrity **Standard** token provider. Call once per app
   * session; the provider is cached natively for subsequent
   * `requestIntegrityToken` calls.
   *
   * @param cloudProjectNumber Your Google Cloud project number, passed as a
   *   string to avoid JS number precision loss. Parsed to a Long natively.
   * @platform android (rejects on iOS with an unsupported-platform error)
   * @throws Rejects with a Play Integrity error code on failure, e.g.
   *   `CLOUD_PROJECT_NUMBER_IS_INVALID`, `PLAY_STORE_NOT_FOUND`, `NETWORK_ERROR`.
   */
  prepareStandardProvider(cloudProjectNumber: string): Promise<void>;

  /**
   * Request a Play Integrity **Standard** token. Requires a prior
   * `prepareStandardProvider`. If the cached provider has expired
   * (`INTEGRITY_TOKEN_PROVIDER_INVALID`), the provider is re-prepared once
   * automatically and the request retried.
   *
   * @param requestHash A base64 SHA-256 digest of the request's critical
   *   parameters (max 500 bytes). Binds the token to a specific action. This
   *   is NOT a server nonce — the caller computes it. May be empty.
   * @returns An opaque, encrypted token string. Forward it to your server;
   *   it cannot be decoded on-device.
   * @platform android (rejects on iOS)
   */
  requestIntegrityToken(requestHash: string): Promise<string>;

  /**
   * Request a Play Integrity **Classic** token (one-off, server-nonce based).
   * Prefer Standard for frequent checks; use Classic for infrequent
   * high-value actions.
   *
   * @param nonce A server-generated, single-use, URL-safe base64 value of
   *   16–500 bytes. Must not contain PII.
   * @param cloudProjectNumber Google Cloud project number as a string.
   * @returns An opaque, encrypted token string (forward to your server).
   * @platform android (rejects on iOS)
   */
  requestClassicIntegrityToken(
    nonce: string,
    cloudProjectNumber: string
  ): Promise<string>;

  // ============================================
  // iOS — APP ATTEST
  // ============================================

  /**
   * Generate a new App Attest key pair in the Secure Enclave.
   *
   * The returned `keyId` is the ONLY handle to this key. **You must persist it
   * yourself** (e.g. Keychain). The library is stateless and does not store it.
   * App Attest keys do not survive app reinstall; regenerate on
   * `DCError.invalidKey`.
   *
   * @returns The new key identifier string.
   * @platform ios 14.0+ (rejects on Android, simulator, or iOS < 14)
   */
  generateKey(): Promise<string>;

  /**
   * Attest a key (one time per key, per installation). Makes a network call to
   * Apple's attestation servers. Send the result to your server for one-time
   * validation against Apple's root CA before trusting subsequent assertions.
   *
   * @param keyId A keyId returned by `generateKey`.
   * @param clientDataHash base64 of the SHA-256 of your server challenge
   *   (plus any client data). The library does NOT hash — you provide the
   *   already-hashed value, matching Apple's `clientDataHash` parameter.
   * @returns base64 of the opaque CBOR attestation object (validate server-side).
   * @platform ios 14.0+ (rejects on Android)
   */
  attestKey(keyId: string, clientDataHash: string): Promise<string>;

  /**
   * Generate an assertion for a subsequent request (offline, no network).
   * Call once per protected request after the key has been attested.
   *
   * @param keyId The attested keyId.
   * @param clientDataHash base64 SHA-256 of `(challenge + request payload)`.
   * @returns base64 of the opaque CBOR assertion object (validate server-side;
   *   the server checks the monotonic counter to detect replays).
   * @platform ios 14.0+ (rejects on Android)
   */
  generateAssertion(keyId: string, clientDataHash: string): Promise<string>;

  // ============================================
  // iOS — DEVICECHECK
  // ============================================

  /**
   * Generate an Apple DeviceCheck token (device-level, lighter than App
   * Attest). Your server queries/updates the device's 2 bits of state via
   * Apple's DeviceCheck server API.
   *
   * @returns base64-encoded DeviceCheck token (validate/use server-side).
   * @platform ios 11.0+ (rejects on Android or unsupported devices)
   */
  getDeviceCheckToken(): Promise<string>;
}
