import { AndroidConfig, type ConfigPlugin, withPlugins } from '@expo/config-plugins';

/**
 * Adds `android.permission.READ_PHONE_STATE` to the Android manifest.
 *
 * Delegates to the high-level `AndroidConfig.Permissions.withPermissions`,
 * which is idempotent (it only adds a `<uses-permission>` that is not already
 * present), so repeated prebuilds never duplicate the entry.
 */
export const withSerialNumber: ConfigPlugin = (config) =>
  withPlugins(config, [
    [AndroidConfig.Permissions.withPermissions, ['android.permission.READ_PHONE_STATE']],
  ]);
