/**
 * Options for the react-native-nitro-device-integrity Expo config plugin.
 */
export type DeviceIntegrityPluginProps = {
  /**
   * Enable iOS App Attest (`DCAppAttestService`) by adding the
   * `com.apple.developer.devicecheck.appattest-environment` entitlement.
   *
   * When `true`, the entitlement is written with the value `"development"`.
   * iOS ignores this value on builds distributed via TestFlight / the App
   * Store and always uses the production environment, so a single static value
   * is correct for both development and release — no per-configuration split.
   *
   * NOTE: this only writes the entitlement. You must also enable the App Attest
   * capability for your App ID in the Apple Developer portal (or via automatic
   * signing); otherwise the build fails to sign (error 0xE8008016). Play
   * Integrity (Android) and DeviceCheck (iOS) need no entitlement and work
   * without this flag.
   *
   * @default false
   */
  appAttest?: boolean;
};
