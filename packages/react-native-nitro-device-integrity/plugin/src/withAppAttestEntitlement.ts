import { type ConfigPlugin, withEntitlementsPlist } from '@expo/config-plugins';

const APP_ATTEST_ENTITLEMENT = 'com.apple.developer.devicecheck.appattest-environment';

/**
 * Writes the App Attest environment entitlement. Setting a key on the
 * entitlements plist is inherently idempotent across repeated prebuilds.
 *
 * `development` is the value Xcode writes when the App Attest capability is
 * toggled on; iOS overrides it to production on distributed builds.
 */
export const withAppAttestEntitlement: ConfigPlugin = (config) =>
  withEntitlementsPlist(config, (cfg) => {
    cfg.modResults[APP_ATTEST_ENTITLEMENT] = 'development';
    return cfg;
  });
