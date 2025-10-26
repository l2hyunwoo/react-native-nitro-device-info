/**
 * Nitro Device Info Module - Complete TypeScript Interface Contract
 *
 * It will be processed by Nitrogen to generate native bindings.
 *
 */

import { type HybridObject } from 'react-native-nitro-modules';

/**
 * Device battery and power information
 */
export interface PowerState {
  /**
   * Battery charge level (0.0 to 1.0)
   * @example 0.75 represents 75% battery
   */
  batteryLevel: number;

  /**
   * Current battery charging status
   */
  batteryState: BatteryState;

  /**
   * Whether low power mode is enabled
   * @platform ios
   */
  lowPowerMode: boolean;
}

/**
 * Device type categories
 */
export type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';

/**
 * Battery charging states
 */
export type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';

/**
 * Main DeviceInfo HybridObject providing comprehensive device information
 *
 * This interface exposes device information methods through Nitro's
 * zero-overhead JSI bindings. Methods are categorized as:
 * - Synchronous (readonly getters): Cached values, access
 * - Asynchronous (Promise methods): I/O operations, <100ms completion
 *
 * @example
 * ```typescript
 * import { NitroModules } from 'react-native-nitro-modules'
 * import type { DeviceInfo } from './specs/DeviceInfo.nitro'
 *
 * const deviceInfo = NitroModules.createHybridObject<DeviceInfo>('DeviceInfo')
 *
 * // Synchronous access (immediate)
 * console.log(deviceInfo.deviceId)      // "iPhone14,2"
 * console.log(deviceInfo.androidId)     // "9774d56d682e549c"
 * console.log(deviceInfo.serialNumber)  // "ABC123XYZ"
 *
 * // Asynchronous access (Promise-based)
 * const uniqueId = await deviceInfo.getUniqueId()
 * const referrer = await deviceInfo.getInstallReferrer()
 * ```
 *
 * @platform ios 13.4+
 * @platform android API 21+
 */
export interface DeviceInfo
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  /* CORE DEVICE INFORMATION (Synchronous) */

  /**
   * Get device model identifier
   *
   * Returns the internal device model string.
   *
   * @returns Model identifier
   * @example
   * iOS: "iPhone14,2" (iPhone 13 Pro)
   * Android: "SM-G998B" (Samsung Galaxy S21)
   *
   *
   */
  readonly deviceId: string;

  /**
   * Get device brand/manufacturer name
   *
   * @returns Brand name
   * @example
   * iOS: "Apple"
   * Android: "Samsung", "Google", "OnePlus", etc.
   *
   *
   */
  readonly brand: string;

  /**
   * Get operating system name
   *
   * @returns OS name
   * @example
   * iOS: "iOS" or "iPadOS"
   * Android: "Android"
   *
   *
   */
  readonly systemName: string;

  /**
   * Get operating system version string
   *
   * @returns Version string
   * @example
   * iOS: "15.0", "16.2.1"
   * Android: "12", "13", "14"
   *
   *
   */
  readonly systemVersion: string;

  /**
   * Get device model name
   *
   * Returns the user-friendly model name.
   *
   * @returns Model name
   * @example
   * iOS: "iPhone", "iPad"
   * Android: "Galaxy S21", "Pixel 7"
   *
   *
   */
  readonly model: string;

  /**
   * Get device type category
   *
   * Categorizes the device by form factor.
   *
   * @returns Device type enum value
   * @example "Handset", "Tablet", "Tv", "Desktop", "unknown"
   *
   *
   */
  readonly deviceType: DeviceType;

  // DEVICE CAPABILITIES (Synchronous)

  /**
   * Check if device is a tablet
   *
   * Detects tablets based on screen size and device type.
   *
   * @returns true if tablet, false if phone/other
   * @example
   * iPad → true
   * iPhone → false
   * Samsung Galaxy Tab → true
   *
   *
   */
  isTablet(): boolean;

  /**
   * Check if device has a display notch
   *
   * Detects the presence of a screen notch (iPhone X and later).
   *
   * @returns true if notch present
   * @example
   * iPhone X, 11, 12, 13 → true
   * iPhone SE, 8 → false
   * Android → false (detection complex, not implemented)
   *
   * @platform ios
   *
   */
  hasNotch(): boolean;

  /**
   * Check if device has Dynamic Island
   *
   * Detects Dynamic Island (iPhone 14 Pro and later).
   *
   * @returns true if Dynamic Island present
   * @example
   * iPhone 14 Pro, 15 Pro → true
   * iPhone 14, 13 → false
   * Android → false
   *
   * @platform ios 16+
   *
   */
  hasDynamicIsland(): boolean;

  // DEVICE IDENTIFICATION (Sync)

  /**
   * Get unique device identifier
   *
   * Returns a persistent device-unique ID:
   * - iOS: IDFV (Identifier for Vendor) - persists across app installs
   * - Android: ANDROID_ID - persists across app installs (usually)
   *
   * @returns Unique ID string
   * @example "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
   *
   *
   */
  getUniqueId(): string;

  /**
   * Get device manufacturer name
   *
   * @returns Manufacturer name
   * @example
   * iOS: "Apple"
   * Android: "Samsung", "Google", "Xiaomi", etc.
   *
   *
   */
  getManufacturer(): string;

  // SYSTEM RESOURCES (Sync)

  /**
   * Get total device RAM in bytes
   *
   * Returns the total physical memory available on the device.
   *
   * @returns Total memory in bytes
   * @example 6442450944 (6 GB)
   *
   *
   */
  getTotalMemory(): number;

  /**
   * Get current app memory usage in bytes
   *
   * Returns the current memory footprint of this app.
   *
   * @returns Used memory in bytes
   * @example 134217728 (128 MB)
   *
   *
   */
  getUsedMemory(): number;

  /**
   * Get total disk storage capacity in bytes
   *
   * Returns the total internal storage size.
   *
   * @returns Total storage in bytes
   * @example 128849018880 (120 GB)
   *
   *
   */
  getTotalDiskCapacity(): number;

  /**
   * Get free disk storage in bytes
   *
   * Returns the currently available free storage space.
   *
   * @returns Free storage in bytes
   * @example 51539607552 (48 GB)
   *
   *
   */
  getFreeDiskStorage(): number;

  /**
   * Get current battery level
   *
   * Returns battery charge level as a float between 0.0 and 1.0.
   *
   * @returns Battery level (0.0 to 1.0)
   * @example 0.75 represents 75% battery
   *
   *
   */
  getBatteryLevel(): number;

  /**
   * Get comprehensive power state information
   *
   * Returns an object containing battery level, charging state,
   * and low power mode status.
   *
   * @returns PowerState object
   * @example
   * {
   *   batteryLevel: 0.75,
   *   batteryState: 'charging',
   *   lowPowerMode: false
   * }
   *
   *
   */
  getPowerState(): PowerState;

  /**
   * Check if battery is currently charging
   *
   * @returns true if charging
   *
   */
  isBatteryCharging(): boolean;

  // APPLICATION METADATA (Sync)

  /**
   * Get application version string
   *
   * @returns Version (e.g., "1.0.0")
   * @example "1.2.3"
   *
   *
   */
  getVersion(): string;

  /**
   * Get application build number
   *
   * @returns Build number
   * @example "42", "20231025"
   *
   *
   */
  getBuildNumber(): string;

  /**
   * Get bundle ID (iOS) or package name (Android)
   *
   * @returns Bundle/package identifier
   * @example
   * iOS: "com.company.app"
   * Android: "com.company.app"
   *
   *
   */
  getBundleId(): string;

  /**
   * Get application display name
   *
   * @returns App name
   * @example "My Awesome App"
   *
   *
   */
  getApplicationName(): string;

  /**
   * Get first install timestamp
   *
   * Returns the timestamp when the app was first installed.
   *
   * @returns Promise resolving to install time in milliseconds since epoch
   * @example 1698249600000 (2023-10-25T12:00:00Z)
   *
   * @async ~10-30ms
   */
  getFirstInstallTime(): Promise<number>;

  /**
   * Get last update timestamp
   *
   * Returns the timestamp of the most recent app update.
   *
   * @returns Promise resolving to update time in milliseconds since epoch
   * @example 1698336000000 (2023-10-26T12:00:00Z)
   *
   * @async ~10-30ms
   */
  getLastUpdateTime(): Promise<number>;

  // NETWORK & CONNECTIVITY (Async)

  /**
   * Get device IP address
   *
   * Returns the local IP address (WiFi or cellular).
   *
   * @returns Promise resolving to IP address string
   * @example "192.168.1.100", "10.0.0.5"
   *
   * @async ~20-50ms
   */
  getIpAddress(): Promise<string>;

  /**
   * Get MAC address
   *
   * Returns the device MAC address.
   *
   * **Note**: iOS returns hardcoded "02:00:00:00:00:00" since iOS 7
   * due to privacy restrictions.
   *
   * @returns Promise resolving to MAC address
   * @example
   * iOS: "02:00:00:00:00:00" (always)
   * Android: "00:11:22:33:44:55" (actual MAC)
   *
   * @async ~20-50ms
   */
  getMacAddress(): Promise<string>;

  /**
   * Get cellular carrier name
   *
   * Returns the name of the mobile network carrier.
   *
   * @returns Promise resolving to carrier name
   * @example "Verizon", "AT&T", "T-Mobile"
   *
   * @async ~20-50ms
   */
  getCarrier(): Promise<string>;

  /**
   * Check if location services are enabled
   *
   * @returns Promise resolving to true if location enabled
   * @async ~10-30ms
   */
  isLocationEnabled(): Promise<boolean>;

  /**
   * Check if headphones are connected
   *
   * Detects both wired and Bluetooth headphones.
   *
   * @returns Promise resolving to true if headphones connected
   * @async ~10-30ms
   */
  isHeadphonesConnected(): Promise<boolean>;

  // DEVICE CAPABILITIES (Sync)

  /**
   * Check if camera is present
   *
   * Detects availability of any camera (front or back).
   *
   * @returns true if camera available
   *
   */
  isCameraPresent(): boolean;

  /**
   * Check if PIN, fingerprint, or Face ID is configured
   *
   * Detects if the device has biometric security set up.
   *
   * @returns true if biometric security set
   *
   */
  isPinOrFingerprintSet(): boolean;

  /**
   * Check if running in emulator/simulator
   *
   * Detects if the app is running on a simulator (iOS) or
   * emulator (Android) rather than a physical device.
   *
   * @returns true if emulator
   *
   */
  isEmulator(): boolean;

  // PLATFORM-SPECIFIC (Sync)

  /**
   * Get Android API level
   *
   * Returns the Android SDK version number.
   *
   * @returns API level (or -1 on iOS)
   * @example
   * Android 12 → 31
   * Android 13 → 33
   * iOS → -1
   *
   * @platform android
   *
   */
  getApiLevel(): number;

  /**
   * Get supported CPU architectures (ABIs)
   *
   * Returns the list of supported CPU instruction sets.
   *
   * @returns Array of ABIs
   * @example
   * iOS: ["arm64"]
   * Android: ["arm64-v8a", "armeabi-v7a"]
   *
   *
   */
  getSupportedAbis(): string[];

  /**
   * Check if Google Mobile Services (GMS) is available
   *
   * Detects if Google Play Services is installed and available.
   *
   * @returns true if GMS available
   * @example
   * Android with Play Services → true
   * Huawei devices without GMS → false
   * iOS → false
   *
   * @platform android
   *
   */
  hasGms(): boolean;

  /**
   * Check if Huawei Mobile Services (HMS) is available
   *
   * Detects if Huawei Mobile Services is installed.
   *
   * @returns true if HMS available
   * @example
   * Huawei devices → true
   * Other Android/iOS → false
   *
   * @platform android (Huawei devices)
   *
   */
  hasHms(): boolean;

  // ANDROID BUILD INFORMATION (Synchronous Properties)

  /**
   * Returns the Android device serial number.
   * Requires READ_PHONE_STATE permission on Android 8.0+.
   * Returns "unknown" on iOS/Windows or when permission denied.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly serialNumber: string;

  /**
   * Returns the Android ID (unique per device/app/user).
   * Returns "unknown" on iOS/Windows.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly androidId: string;

  /**
   * Returns the Android security patch level (YYYY-MM-DD format).
   * Available on Android API 23+.
   * Returns "unknown" on iOS or Android <23.
   *
   * @platform Android API 23+ (returns "unknown" on iOS)
   *
   */
  readonly securityPatch: string;

  /**
   * Returns the system bootloader version string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly bootloader: string;

  /**
   * Returns the current development codename (e.g., "REL" for release).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly codename: string;

  /**
   * Returns the device board/platform name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly device: string;

  /**
   * Returns the build display ID string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly display: string;

  /**
   * Returns the build fingerprint (unique build identifier).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly fingerprint: string;

  /**
   * Returns the hardware name/identifier.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly hardware: string;

  /**
   * Returns the build host machine name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly host: string;

  /**
   * Returns the product name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly product: string;

  /**
   * Returns the build tags (comma-separated).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly tags: string;

  /**
   * Returns the build type (e.g., "user", "userdebug", "eng").
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly type: string;

  /**
   * Returns the base OS build version (may be empty for initial release).
   * Available on Android API 23+.
   * Returns "" on iOS or Android <23.
   *
   * @platform Android API 23+ (returns "" on iOS)
   *
   */
  readonly baseOs: string;

  /**
   * Returns the preview SDK version (0 for release builds).
   * Available on Android API 23+.
   * Returns 0 on iOS or Android <23.
   *
   * @platform Android API 23+ (returns 0 on iOS)
   *
   */
  readonly previewSdkInt: number;

  /**
   * Returns the incremental version string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly incremental: string;

  /**
   * Returns the build ID string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   *
   */
  readonly buildId: string;

  // INSTALLATION METADATA

  /**
   * Get the package name of the app store that installed this app.
   * Returns "unknown" if sideloaded or can't determine.
   *
   * @platform iOS, Android
   *
   */
  readonly installerPackageName: string;

  /**
   * Get the device boot time as milliseconds since epoch.
   * Returns boot time, NOT app startup time.
   *
   * @platform iOS, Android
   *
   */
  readonly startupTime: number;

  /**
   * Get human-readable version string (version + build).
   * Format: "version.buildNumber"
   *
   * @platform All
   *
   */
  readonly readableVersion: string;

  /**
   * Get first install timestamp (sync variant).
   * Uses cached value from module initialization.
   *
   * @platform iOS, Android
   *
   */
  readonly firstInstallTimeSync: number;

  /**
   * Get last update timestamp (sync variant).
   * Returns -1 on iOS.
   *
   * @platform Android (returns -1 on iOS)
   *
   */
  readonly lastUpdateTimeSync: number;

  /**
   * Get the install referrer information (Android Play Store).
   * Requires Google Play Services.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   * @async ~50-200ms (Play Services API call)
   */
  getInstallReferrer(): Promise<string>;

  // ADVANCED CAPABILITIES & SYSTEM INFORMATION

  /**
   * Check if wired headphones are currently connected.
   * Returns false on platforms other than iOS/Android.
   *
   * @platform iOS, Android
   *
   */
  isWiredHeadphonesConnected(): boolean;

  /**
   * Check if Bluetooth headphones are currently connected.
   * Returns false on platforms other than iOS/Android.
   *
   * @platform iOS, Android
   *
   */
  isBluetoothHeadphonesConnected(): boolean;

  /**
   * Check if airplane mode is enabled.
   * Returns false on iOS (not available).
   *
   * @platform Android (returns false on iOS)
   *
   */
  isAirplaneMode(): boolean;

  /**
   * Check if device is classified as low RAM device.
   * Returns false on iOS or Android <19.
   *
   * @platform Android API 19+ (returns false on iOS)
   *
   */
  isLowRamDevice(): boolean;

  /**
   * Check if a mouse is currently connected.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   *
   */
  isMouseConnected(): boolean;

  /**
   * Check if a physical keyboard is currently connected.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   *
   */
  isKeyboardConnected(): boolean;

  /**
   * Check if device is in landscape orientation.
   * Computed from Dimensions API (width > height).
   *
   * @platform All
   *
   */
  isLandscape(): boolean;

  /**
   * Get list of supported 32-bit ABIs.
   * Returns [] on iOS.
   *
   * @platform Android API 21+ (returns [] on iOS)
   *
   */
  getSupported32BitAbis(): string[];

  /**
   * Get list of supported 64-bit ABIs.
   * Returns ["arm64"] on iOS.
   *
   * @platform Android API 21+, iOS
   *
   */
  getSupported64BitAbis(): string[];

  /**
   * Get current font scale multiplier.
   * Returns 1.0 (normal) on platforms without font scaling.
   *
   * @platform iOS, Android
   *
   */
  getFontScale(): number;

  /**
   * Check if specific system feature is available.
   * Returns false on iOS.
   *
   * @param feature Feature identifier (e.g., "android.hardware.camera")
   * @platform Android (returns false on iOS)
   *
   */
  hasSystemFeature(feature: string): boolean;

  /**
   * Get list of all available system features.
   * Returns [] on iOS.
   *
   * @platform Android (returns [] on iOS)
   *
   */
  getSystemAvailableFeatures(): string[];

  /**
   * Get list of available location providers.
   * Returns {} on platforms without location services.
   *
   * @platform iOS, Android
   *
   */
  getAvailableLocationProviders(): Record<string, boolean>;

  /**
   * Get list of Windows host names.
   * Returns [] on iOS/Android.
   *
   * @platform Windows (returns [] on iOS/Android)
   *
   */
  getHostNames(): string[];

  /**
   * Get maximum memory available to app (in bytes).
   * Returns -1 on iOS.
   *
   * @platform Android (returns -1 on iOS)
   *
   */
  getMaxMemory(): number;

  /**
   * Get list of supported media/codec types.
   * Returns [] on iOS.
   *
   * @platform Android (returns [] on iOS)
   *
   */
  getSupportedMediaTypeList(): string[];

  /**
   * Check if battery level is below threshold.
   * Userland helper using getBatteryLevel().
   *
   * @param threshold Battery level threshold (0.0 to 1.0)
   * @platform All
   *
   */
  isLowBatteryLevel(threshold: number): boolean;

  /**
   * Check if Windows tablet mode is active.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   *
   */
  isTabletMode(): boolean;

  // NETWORK & DISPLAY INFORMATION

  /**
   * Get user-assigned device name.
   * Returns "unknown" on platforms without device naming.
   *
   * @platform iOS, Android
   *
   */
  getDeviceName(): string;

  /**
   * Get IP address (sync variant).
   * Uses cached value (refreshed every 5 seconds).
   *
   * @platform iOS, Android
   *
   */
  readonly ipAddressSync: string;

  /**
   * Get MAC address (sync variant).
   * iOS returns "02:00:00:00:00:00" (hardcoded per Apple privacy policy).
   *
   * @platform iOS (hardcoded), Android
   *
   */
  readonly macAddressSync: string;

  /**
   * Get carrier name (sync variant).
   * Uses cached value from telephony manager.
   *
   * @platform iOS, Android
   *
   */
  readonly carrierSync: string;

  /**
   * Check if location services enabled (sync variant).
   *
   * @platform iOS, Android
   *
   */
  readonly isLocationEnabledSync: boolean;

  /**
   * Check if headphones connected (sync variant).
   * Checks for wired OR Bluetooth headphones.
   *
   * @platform iOS, Android
   *
   */
  readonly isHeadphonesConnectedSync: boolean;

  /**
   * Get HTTP User-Agent string.
   * iOS requires WebView initialization (heavy operation, cached after first call).
   * Android can return synchronously from System.getProperty().
   *
   * @platform iOS (async), Android, Web
   * @async iOS: 100-500ms (WebView init), Android: sync capable
   */
  getUserAgent(): Promise<string>;

  // iOS-SPECIFIC FEATURES

  /**
   * Check if iOS Display Zoom is enabled.
   * Returns false on Android.
   *
   * @platform iOS (returns false on Android)
   *
   */
  isDisplayZoomed(): boolean;

  /**
   * Get current screen brightness level.
   * Returns -1 on Android.
   *
   * @platform iOS (returns -1 on Android)
   *
   */
  getBrightness(): number;

  /**
   * Get Apple DeviceCheck token.
   * Requires network request to Apple servers.
   * Throws error on Android.
   *
   * @platform iOS 11+ (throws on Android)
   * @async ~500-2000ms (network request)
   */
  getDeviceToken(): Promise<string>;

  /**
   * Synchronize unique ID to iCloud Keychain.
   * Saves IDFV to Keychain on iOS (persists across reinstalls).
   * Returns getUniqueId() on Android without Keychain sync.
   *
   * @platform iOS (no-op on Android)
   * @async ~10-50ms (Keychain I/O)
   */
  syncUniqueId(): Promise<string>;

  // LEGACY COMPATIBILITY

  /**
   * Get total disk capacity using legacy Android API.
   * On Android: uses old StatFs API (pre-Jelly Bean compatibility).
   * On iOS: alias to getTotalDiskCapacity().
   *
   * @platform Android (alias on iOS)
   *
   */
  getTotalDiskCapacityOld(): number;

  /**
   * Get free disk storage using legacy Android API.
   * On Android: uses old StatFs API (pre-Jelly Bean compatibility).
   * On iOS: alias to getFreeDiskStorage().
   *
   * @platform Android (alias on iOS)
   *
   */
  getFreeDiskStorageOld(): number;
}
