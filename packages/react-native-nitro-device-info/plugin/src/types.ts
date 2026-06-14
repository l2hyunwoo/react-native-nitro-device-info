/**
 * Options for the react-native-nitro-device-info Expo config plugin.
 *
 * Every native capability that needs an extra permission is opt-in and
 * defaults to off — declaring permissions a user does not need risks Play
 * Store / App Store rejection.
 */
export type DeviceInfoPluginProps = {
  /**
   * Add the Android `READ_PHONE_STATE` permission so `serialNumber` can return
   * the real device serial on Android 8.0+ (`Build.getSerial()` is guarded by
   * this runtime permission). Without it, `serialNumber` returns `"unknown"`.
   *
   * `READ_PHONE_STATE` is a sensitive permission — only enable this if you
   * actually read `serialNumber`, and be ready to justify it in your Play
   * Data Safety form.
   *
   * @default false
   */
  enableSerialNumber?: boolean;
};
