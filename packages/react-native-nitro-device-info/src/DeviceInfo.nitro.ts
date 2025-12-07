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
 * Android navigation mode types
 *
 * @platform Android (returns 'unknown' on iOS)
 */
export type NavigationMode = 'gesture' | 'buttons' | 'twobuttons' | 'unknown';

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
  // ============================================
  // CORE DEVICE INFORMATION
  // ============================================

  /**
   * Get device model identifier
   *
   * Returns the internal device model string.
   *
   * @returns Model identifier
   * @example
   * iOS: "iPhone14,2" (iPhone 13 Pro)
   * Android: "SM-G998B" (Samsung Galaxy S21)
   */
  readonly deviceId: string;

  /**
   * Get device brand/manufacturer name
   *
   * @returns Brand name
   * @example
   * iOS: "Apple"
   * Android: "Samsung", "Google", "OnePlus", etc.
   */
  readonly brand: string;

  /**
   * Get device model name
   *
   * Returns the user-friendly model name.
   *
   * @returns Model name
   * @example
   * iOS: "iPhone", "iPad"
   * Android: "Galaxy S21", "Pixel 7"
   */
  readonly model: string;

  /**
   * Get operating system name
   *
   * @returns OS name
   * @example
   * iOS: "iOS" or "iPadOS"
   * Android: "Android"
   */
  readonly systemName: string;

  /**
   * Get operating system version string
   *
   * @returns Version string
   * @example
   * iOS: "15.0", "16.2.1"
   * Android: "12", "13", "14"
   */
  readonly systemVersion: string;

  /**
   * Get device type category
   *
   * Categorizes the device by form factor.
   *
   * @returns Device type enum value
   * @example "Handset", "Tablet", "Tv", "Desktop", "unknown"
   */
  readonly deviceType: DeviceType;

  /**
   * Get unique device identifier
   *
   * Returns a persistent device-unique ID:
   * - iOS: IDFV (Identifier for Vendor) - persists across app installs
   * - Android: ANDROID_ID - persists across app installs (usually)
   *
   * @returns Unique ID string
   * @example "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
   */
  readonly uniqueId: string;

  /**
   * Get device manufacturer name
   *
   * @returns Manufacturer name
   * @example
   * iOS: "Apple"
   * Android: "Samsung", "Google", "Xiaomi", etc.
   */
  readonly manufacturer: string;

  /**
   * Get user-assigned device name.
   * Returns "unknown" on platforms without device naming.
   *
   * @platform iOS, Android
   */
  readonly deviceName: string;

  // ============================================
  // DEVICE CAPABILITIES
  // ============================================

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
   */
  readonly isTablet: boolean;

  /**
   * Check if running in emulator/simulator
   *
   * Detects if the app is running on a simulator (iOS) or
   * emulator (Android) rather than a physical device.
   *
   * @returns true if emulator
   */
  readonly isEmulator: boolean;

  /**
   * Get estimated device year class based on hardware specifications
   *
   * Returns an estimated "year class" representing when this device's
   * hardware would have been considered flagship/high-end.
   *
   * Based on extended Facebook device-year-class algorithm updated for 2025:
   * - Uses RAM as primary classifier with CPU cores/frequency as secondary
   * - Supports modern devices with 16GB+ RAM (returns 2025)
   * - Cached after first access (hardware specs don't change)
   *
   * **RAM → Year Class mapping:**
   * - ≤2 GB: 2013
   * - ≤4 GB: 2015
   * - ≤6 GB: 2017
   * - ≤8 GB: 2019
   * - ≤12 GB: 2021
   * - ≤16 GB: 2023
   * - >16 GB: 2025
   *
   * @returns Year class (2008-2025) or -1 if unknown
   * @example
   * ```typescript
   * const yearClass = DeviceInfoModule.deviceYearClass;
   * if (yearClass >= 2020) {
   *   enableHighEndFeatures();
   * } else if (yearClass >= 2015) {
   *   enableStandardFeatures();
   * } else {
   *   enableLowEndFeatures();
   * }
   * ```
   *
   * @platform iOS, Android
   */
  readonly deviceYearClass: number;

  /**
   * Check if camera is present
   *
   * Detects availability of any camera (front or back).
   *
   * @returns true if camera available
   */
  readonly isCameraPresent: boolean;

  /**
   * Check if PIN, fingerprint, or Face ID is configured
   *
   * Detects if the device has biometric security set up.
   *
   * @returns true if biometric security set
   */
  readonly isPinOrFingerprintSet: boolean;

  /**
   * Check if hardware-backed key storage is available
   *
   * Detects if the device supports hardware-backed cryptographic key storage:
   * - Android: Hardware-backed KeyStore (TEE or StrongBox)
   * - iOS: Secure Enclave
   *
   * Hardware backing means cryptographic keys are stored in secure hardware
   * isolated from the main CPU, providing enhanced security against extraction.
   *
   * @returns true if hardware-backed key storage available
   * @example
   * Android with TEE/StrongBox → true
   * iOS with Secure Enclave (iPhone 5s+) → true
   * iOS Simulator → false
   * Older/low-end devices → false
   *
   * @platform iOS, Android
   */
  readonly isHardwareKeyStoreAvailable: boolean;

  /**
   * Check if device is classified as low RAM device.
   * Returns false on iOS or Android <19.
   *
   * @platform Android API 19+ (returns false on iOS)
   */
  readonly isLowRamDevice: boolean;

  // ============================================
  // DISPLAY & SCREEN
  // ============================================

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
   */
  getHasNotch(): boolean;

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
   */
  getHasDynamicIsland(): boolean;

  /**
   * Check if iOS Display Zoom is enabled.
   * Returns false on Android.
   *
   * @platform iOS (returns false on Android)
   */
  readonly isDisplayZoomed: boolean;

  /**
   * Check if device is in landscape orientation.
   *
   * This value changes with device rotation.
   * Computed from Dimensions API (width > height).
   *
   * @returns true if width > height
   * @platform All
   */
  getIsLandscape(): boolean;

  /**
   * Get current screen brightness level.
   *
   * This value changes with user adjustment.
   *
   * @returns Brightness 0.0-1.0 on iOS, -1 on Android
   * @platform iOS only (returns -1 on Android)
   */
  getBrightness(): number;

  /**
   * Get current font scale multiplier.
   *
   * This value changes with accessibility settings.
   *
   * @returns Font scale (1.0 = normal)
   * @platform iOS, Android
   */
  getFontScale(): number;

  /**
   * Check if liquid glass effect is available.
   * Requires iOS 26.0+ and returns false on Android.
   *
   * @platform iOS 26.0+ (returns false on Android)
   */
  readonly isLiquidGlassAvailable: boolean;

  // ============================================
  // SYSTEM RESOURCES
  // ============================================

  /**
   * Get total device RAM in bytes
   *
   * Returns the total physical memory available on the device.
   *
   * @returns Total memory in bytes
   * @example 6442450944 (6 GB)
   */
  readonly totalMemory: number;

  /**
   * Get current app memory usage in bytes
   *
   * Returns the current memory footprint of this app.
   * This value changes constantly with memory allocation.
   *
   * @returns Used memory in bytes, 0 if error
   * @example 134217728 (128 MB)
   */
  getUsedMemory(): number;

  /**
   * Get maximum memory available to app (in bytes).
   * Returns -1 on iOS.
   *
   * @platform Android (returns -1 on iOS)
   */
  readonly maxMemory: number;

  /**
   * Get total disk storage capacity in bytes
   *
   * Returns the total internal storage size.
   *
   * @returns Total storage in bytes
   * @example 128849018880 (120 GB)
   */
  readonly totalDiskCapacity: number;

  /**
   * Get free disk storage in bytes
   *
   * Returns the currently available free storage space.
   * This value changes with file writes/deletes.
   *
   * @returns Free storage in bytes, 0 if error
   * @example 51539607552 (48 GB)
   */
  getFreeDiskStorage(): number;

  /**
   * Get device uptime since boot in milliseconds
   *
   * Returns the time elapsed since the device was last booted,
   * excluding time spent in deep sleep.
   *
   * **Platform behavior:**
   * - **iOS**: Uses `systemUptime` (excludes deep sleep)
   * - **Android**: Uses `uptimeMillis()` (excludes deep sleep)
   *
   * Both platforms return consistent "active time" since boot.
   * This matches the behavior of `expo-device.getUptimeAsync()`.
   *
   * @returns Uptime in milliseconds (excludes deep sleep on both platforms)
   * @example
   * ```typescript
   * const uptime = DeviceInfoModule.getUptime();
   * const hours = Math.floor(uptime / 1000 / 60 / 60);
   * console.log(`Device has been running for ${hours} hours`);
   * ```
   *
   * @platform iOS, Android
   */
  getUptime(): number;

  /**
   * Get the device boot time as milliseconds since epoch.
   * Returns boot time, NOT app startup time.
   *
   * @platform iOS, Android
   */
  readonly startupTime: number;

  // ============================================
  // BATTERY & POWER
  // ============================================

  /**
   * Get current battery level
   *
   * Returns battery charge level as a float between 0.0 and 1.0.
   * This value changes as battery drains/charges.
   *
   * @returns Battery level (0.0 to 1.0), 0.0 if unavailable
   * @example 0.75 represents 75% battery
   */
  getBatteryLevel(): number;

  /**
   * Get comprehensive power state information
   *
   * Returns an object containing battery level, charging state,
   * and low power mode status. Values change with charging/low-power mode.
   *
   * @returns PowerState object with battery level, state, and low power mode
   * @example
   * {
   *   batteryLevel: 0.75,
   *   batteryState: 'charging',
   *   lowPowerMode: false
   * }
   */
  getPowerState(): PowerState;

  /**
   * Check if battery is currently charging
   *
   * This value changes when device is plugged/unplugged.
   *
   * @returns true if charging or full
   */
  getIsBatteryCharging(): boolean;

  /**
   * Check if battery level is below threshold.
   * Userland helper using getBatteryLevel().
   *
   * @param threshold Battery level threshold (0.0 to 1.0)
   * @platform All
   */
  isLowBatteryLevel(threshold: number): boolean;

  // ============================================
  // APPLICATION METADATA
  // ============================================

  /**
   * Get application version string
   *
   * @returns Version (e.g., "1.0.0")
   * @example "1.2.3"
   */
  readonly version: string;

  /**
   * Get application build number
   *
   * @returns Build number
   * @example "42", "20231025"
   */
  readonly buildNumber: string;

  /**
   * Get bundle ID (iOS) or package name (Android)
   *
   * @returns Bundle/package identifier
   * @example
   * iOS: "com.company.app"
   * Android: "com.company.app"
   */
  readonly bundleId: string;

  /**
   * Get application display name
   *
   * @returns App name
   * @example "My Awesome App"
   */
  readonly applicationName: string;

  /**
   * Get human-readable version string (version + build).
   * Format: "version.buildNumber"
   *
   * @platform All
   */
  readonly readableVersion: string;

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

  /**
   * Get first install timestamp (sync variant).
   * Uses cached value from module initialization.
   *
   * @platform iOS, Android
   */
  readonly firstInstallTimeSync: number;

  /**
   * Get last update timestamp (sync variant).
   * Returns -1 on iOS.
   *
   * @platform Android (returns -1 on iOS)
   */
  readonly lastUpdateTimeSync: number;

  // ============================================
  // NETWORK
  // ============================================

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
   * Get current IP address (cached for 5 seconds).
   *
   * This value changes with network switch.
   *
   * @returns IP address string or "unknown"
   * @platform iOS, Android
   */
  getIpAddressSync(): string;

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
   * Get MAC address (cached for 5 seconds).
   *
   * @returns MAC address string or "unknown"
   * @platform iOS: Always returns "02:00:00:00:00:00" (privacy restriction)
   * @platform Android: Actual MAC address
   */
  getMacAddressSync(): string;

  /**
   * Get HTTP User-Agent string.
   * iOS requires WebView initialization (heavy operation, cached after first call).
   * Android can return synchronously from System.getProperty().
   *
   * @platform iOS (async), Android, Web
   * @async iOS: 100-500ms (WebView init), Android: sync capable
   */
  getUserAgent(): Promise<string>;

  /**
   * Check if airplane mode is enabled.
   *
   * This value changes when user toggles airplane mode.
   *
   * @returns true if airplane mode is on
   * @platform Android only (returns false on iOS)
   */
  getIsAirplaneMode(): boolean;

  // ============================================
  // CARRIER INFORMATION
  // ============================================

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
   * Get carrier name (cached for 5 seconds).
   *
   * This value can change with SIM swap.
   *
   * @returns Carrier name or "unknown"
   * @platform iOS, Android
   */
  getCarrierSync(): string;

  /**
   * Check if carrier allows VoIP calls on its network
   *
   * Indicates whether the carrier allows making Voice over IP (VoIP) calls
   * on its network. This is determined by the carrier's network policy.
   *
   * @example
   * ```typescript
   * if (DeviceInfoModule.carrierAllowsVOIP) {
   *   // Enable VoIP calling features
   * }
   * ```
   *
   * @platform iOS (returns true on Android - no equivalent API)
   */
  readonly carrierAllowsVOIP: boolean;

  /**
   * ISO country code for the carrier
   *
   * The ISO 3166-1 alpha-2 country code for the user's
   * cellular service provider.
   *
   * @example
   * ```typescript
   * console.log(DeviceInfoModule.carrierIsoCountryCode); // "US"
   * ```
   *
   * @platform iOS, Android
   */
  readonly carrierIsoCountryCode: string;

  /**
   * Mobile Country Code (MCC)
   *
   * The Mobile Country Code per ITU-T Recommendation E.212.
   * The MCC is a 3-digit code that identifies the country of the carrier.
   *
   * @example
   * ```typescript
   * console.log(DeviceInfoModule.mobileCountryCode); // "310" (USA)
   * ```
   *
   * @platform iOS, Android
   */
  readonly mobileCountryCode: string;

  /**
   * Mobile Network Code (MNC)
   *
   * The Mobile Network Code that identifies the carrier
   * within a country. The MNC is typically 2-3 digits.
   *
   * @example
   * ```typescript
   * console.log(DeviceInfoModule.mobileNetworkCode); // "260" (T-Mobile US)
   * ```
   *
   * @platform iOS, Android
   */
  readonly mobileNetworkCode: string;

  /**
   * Mobile Network Operator (MCC + MNC combined)
   *
   * The combined Mobile Country Code and Mobile Network Code
   * as a single string. Equivalent to `mobileCountryCode + mobileNetworkCode`.
   *
   * @example
   * ```typescript
   * console.log(DeviceInfoModule.mobileNetworkOperator); // "310260" (T-Mobile US)
   * ```
   *
   * @platform iOS, Android
   */
  readonly mobileNetworkOperator: string;

  // ============================================
  // AUDIO ACCESSORIES
  // ============================================

  /**
   * Check if headphones are connected
   *
   * Detects both wired and Bluetooth headphones.
   *
   * @returns Promise resolving to true if headphones connected
   * @async ~10-30ms
   */
  isHeadphonesConnected(): Promise<boolean>;

  /**
   * Check if any headphones are connected (wired or Bluetooth).
   *
   * This value changes when headphones connect/disconnect.
   *
   * @returns true if any headphones connected
   * @platform iOS, Android
   */
  getIsHeadphonesConnected(): boolean;

  /**
   * Check if wired headphones are currently connected.
   *
   * This value changes when headphones are plugged/unplugged.
   *
   * @returns true if wired headphones detected
   * @platform iOS, Android
   */
  getIsWiredHeadphonesConnected(): boolean;

  /**
   * Check if Bluetooth headphones are currently connected.
   *
   * This value changes when Bluetooth audio devices connect/disconnect.
   *
   * @returns true if Bluetooth audio device detected
   * @platform iOS, Android
   */
  getIsBluetoothHeadphonesConnected(): boolean;

  // ============================================
  // LOCATION SERVICES
  // ============================================

  /**
   * Check if location services are enabled
   *
   * @returns Promise resolving to true if location enabled
   * @async ~10-30ms
   */
  isLocationEnabled(): Promise<boolean>;

  /**
   * Check if location services are enabled.
   *
   * This value changes with settings toggle.
   *
   * @returns true if location services enabled
   * @platform iOS, Android
   */
  getIsLocationEnabled(): boolean;

  /**
   * Get list of enabled location providers.
   *
   * This value changes with provider enable/disable.
   *
   * @returns Array of provider names (e.g., ["gps", "network"])
   * @platform iOS, Android
   */
  getAvailableLocationProviders(): string[];

  // ============================================
  // LOCALIZATION
  // ============================================

  /**
   * Get device system language in BCP 47 format
   *
   * Returns the user's preferred language/locale.
   * On iOS 13.1+ and Android 13+, this reflects per-app language settings if configured.
   *
   * @returns Language tag string in BCP 47 format
   * @example
   * iOS: "en-US", "ko-KR", "zh-Hans-CN"
   * Android: "en-US", "ko-KR", "ja-JP"
   *
   * @platform iOS, Android
   */
  readonly systemLanguage: string;

  // ============================================
  // CPU & ARCHITECTURE
  // ============================================

  /**
   * Get supported CPU architectures (ABIs)
   *
   * Returns the list of supported CPU instruction sets.
   *
   * @returns Array of ABIs
   * @example
   * iOS: ["arm64"]
   * Android: ["arm64-v8a", "armeabi-v7a"]
   */
  readonly supportedAbis: string[];

  /**
   * Get list of supported 32-bit ABIs.
   * Returns [] on iOS.
   *
   * @platform Android API 21+ (returns [] on iOS)
   */
  readonly supported32BitAbis: string[];

  /**
   * Get list of supported 64-bit ABIs.
   * Returns ["arm64"] on iOS.
   *
   * @platform Android API 21+, iOS
   */
  readonly supported64BitAbis: string[];

  // ============================================
  // ANDROID PLATFORM
  // ============================================

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
   */
  readonly apiLevel: number;

  /**
   * Get Android navigation mode
   *
   * Detects the current navigation mode on Android devices.
   * Useful for adjusting UI to avoid gesture conflicts.
   *
   * @returns Navigation mode type
   * @example
   * Android gesture navigation → "gesture"
   * Android 3-button navigation → "buttons"
   * Android 2-button navigation → "twobuttons"
   * iOS → "unknown" (not applicable)
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly navigationMode: NavigationMode;

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
   */
  getHasGms(): boolean;

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
   */
  getHasHms(): boolean;

  /**
   * Check if specific system feature is available.
   * Returns false on iOS.
   *
   * @param feature Feature identifier (e.g., "android.hardware.camera")
   * @platform Android (returns false on iOS)
   */
  hasSystemFeature(feature: string): boolean;

  /**
   * Get list of all available system features.
   * Returns [] on iOS.
   *
   * @platform Android (returns [] on iOS)
   */
  readonly systemAvailableFeatures: string[];

  /**
   * Get list of supported media/codec types.
   * Returns [] on iOS.
   *
   * @platform Android (returns [] on iOS)
   */
  readonly supportedMediaTypeList: string[];

  // Android Build Information

  /**
   * Returns the Android device serial number.
   * Requires READ_PHONE_STATE permission on Android 8.0+.
   * Returns "unknown" on iOS/Windows or when permission denied.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly serialNumber: string;

  /**
   * Returns the Android ID (unique per device/app/user).
   * Returns "unknown" on iOS/Windows.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly androidId: string;

  /**
   * Returns the preview SDK version (0 for release builds).
   * Available on Android API 23+.
   * Returns 0 on iOS or Android <23.
   *
   * @platform Android API 23+ (returns 0 on iOS)
   */
  readonly previewSdkInt: number;

  /**
   * Returns the Android security patch level (YYYY-MM-DD format).
   * Available on Android API 23+.
   * Returns "unknown" on iOS or Android <23.
   *
   * @platform Android API 23+ (returns "unknown" on iOS)
   */
  readonly securityPatch: string;

  /**
   * Returns the current development codename (e.g., "REL" for release).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly codename: string;

  /**
   * Returns the incremental version string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly incremental: string;

  /**
   * Returns the device board/platform name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly board: string;

  /**
   * Returns the system bootloader version string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly bootloader: string;

  /**
   * Returns the device board/platform name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly device: string;

  /**
   * Returns the build display ID string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly display: string;

  /**
   * Returns the build fingerprint (unique build identifier).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly fingerprint: string;

  /**
   * Returns the hardware name/identifier.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly hardware: string;

  /**
   * Returns the build host machine name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly host: string;

  /**
   * Returns the product name.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly product: string;

  /**
   * Returns the build tags (comma-separated).
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly tags: string;

  /**
   * Returns the build type (e.g., "user", "userdebug", "eng").
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly type: string;

  /**
   * Returns the base OS build version (may be empty for initial release).
   * Available on Android API 23+.
   * Returns "" on iOS or Android <23.
   *
   * @platform Android API 23+ (returns "" on iOS)
   */
  readonly baseOs: string;

  /**
   * Returns the radio/baseband version.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly radioVersion: string;

  /**
   * Returns the build ID string.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   */
  readonly buildId: string;

  // ============================================
  // iOS PLATFORM
  // ============================================

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

  // ============================================
  // INSTALLATION & DISTRIBUTION
  // ============================================

  /**
   * Get the package name of the app store that installed this app.
   * Returns "unknown" if sideloaded or can't determine.
   *
   * @platform iOS, Android
   */
  readonly installerPackageName: string;

  /**
   * Get the install referrer information (Android Play Store).
   * Requires Google Play Services.
   * Returns "unknown" on iOS.
   *
   * @platform Android (returns "unknown" on iOS)
   * @async ~50-200ms (Play Services API call)
   */
  getInstallReferrer(): Promise<string>;

  /**
   * Check if sideloading (installing from unknown sources) is enabled
   *
   * **Platform behavior:**
   * - **Android 7 and below**: Returns whether the device allows unknown sources globally
   *   (checks `Settings.Global.INSTALL_NON_MARKET_APPS`)
   * - **Android 8.0+**: Returns whether THIS APP has permission to install other apps
   *   (per-app permission via `canRequestPackageInstalls()`)
   * - **iOS**: Always returns `false` (sideloading not possible without jailbreak)
   *
   * **Important:** On Android 8.0+, even if the user has enabled "Install unknown apps"
   * for other apps, this will return `false` unless they specifically granted
   * permission to this app.
   *
   * **Prerequisite (Android 8.0+):** For `canRequestPackageInstalls()` to return `true`,
   * your app must declare `REQUEST_INSTALL_PACKAGES` permission in AndroidManifest.xml:
   * ```xml
   * <uses-permission android:name="android.permission.REQUEST_INSTALL_PACKAGES" />
   * ```
   * Without this permission, this method will always return `false` on Android 8.0+.
   *
   * @returns `true` if this app can install packages from unknown sources
   * @example
   * ```typescript
   * if (DeviceInfoModule.isSideLoadingEnabled()) {
   *   console.warn('Device allows sideloading - potential security risk');
   * }
   * ```
   *
   * @platform Android (returns false on iOS)
   */
  isSideLoadingEnabled(): boolean;

  // ============================================
  // LEGACY COMPATIBILITY
  // ============================================

  /**
   * Get total disk capacity using legacy Android API.
   * On Android: uses old StatFs API (pre-Jelly Bean compatibility).
   * On iOS: alias to getTotalDiskCapacity().
   *
   * @platform Android (alias on iOS)
   */
  readonly totalDiskCapacityOld: number;

  /**
   * Get free disk storage using legacy API.
   *
   * On Android: uses old StatFs API (pre-Jelly Bean compatibility).
   * On iOS: alias to getFreeDiskStorage().
   * This value changes with file writes/deletes.
   *
   * @returns Free storage in bytes. Returns -1 on error (Android), 0 on error (iOS).
   * @platform Android (alias on iOS)
   */
  getFreeDiskStorageOld(): number;

  // ============================================
  // DEVICE INTEGRITY / SECURITY
  // ============================================

  /**
   * Synchronously detects rooted (Android) or jailbroken (iOS) device status
   *
   * **LOCAL DETECTION ONLY** - Does NOT use Play Integrity API or iOS App Attest.
   * All detection methods can be bypassed by sophisticated tools.
   * Always returns `false` on emulators/simulators for development convenience.
   *
   * **Android Detection:**
   * - su binary paths (`/system/xbin/su`, `/system/bin/su`, `/sbin/su`, etc.)
   * - Magisk files/packages (`/data/adb/magisk`, Magisk Manager)
   * - KernelSU files (`/data/adb/ksu`)
   * - APatch files (`/data/adb/apatch`)
   * - Busybox presence (`/system/xbin/busybox`)
   * - Build props tampering (`ro.debuggable=1`, `ro.secure=0`)
   * - Superuser apps (legacy)
   *
   * **iOS Detection:**
   * - Jailbreak apps (Cydia, Sileo, Zebra, Installer 5)
   * - URL scheme responses (`cydia://`, `sileo://`)
   * - System file write test (`/private/jailbreak.txt`)
   * - DYLD injection detection
   * - Symbolic links (`/Applications`, `/Library/Ringtones`)
   * - SSH ports (22, 44)
   *
   * **Limitations:**
   * - All detection methods can be bypassed (Magisk + Shamiko, RootHide, etc.)
   * - "Not detected" does NOT mean the device is secure
   *
   * @returns `true` if device is rooted/jailbroken, `false` otherwise
   * @example
   * ```typescript
   * if (DeviceInfoModule.isDeviceCompromised()) {
   *   // Restrict security-sensitive features
   *   console.warn('Rooted/Jailbroken device detected');
   * }
   * ```
   *
   * @platform iOS, Android
   */
  isDeviceCompromised(): boolean;

  /**
   * Asynchronous wrapper for device integrity verification
   *
   * Currently identical to `isDeviceCompromised()` but wrapped in a Promise.
   * Provided for API consistency and future extensibility.
   *
   * **iOS:** Includes SSH port scanning (can take up to 200ms) in addition to
   * all checks performed by `isDeviceCompromised()`.
   *
   * **Android:** Same as `isDeviceCompromised()` (async wrapper only).
   *
   * @returns Promise resolving to `true` if device is rooted/jailbroken
   * @example
   * ```typescript
   * const isCompromised = await DeviceInfoModule.verifyDeviceIntegrity();
   * if (isCompromised) {
   *   // Block financial transactions, etc.
   * }
   * ```
   *
   * @platform iOS, Android
   * @async iOS: up to 200ms (includes SSH port scan), Android: <50ms
   */
  verifyDeviceIntegrity(): Promise<boolean>;

  // ============================================
  // WINDOWS PLATFORM (Unsupported)
  // ============================================

  /**
   * Check if a mouse is currently connected.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   */
  readonly isMouseConnected: boolean;

  /**
   * Check if a physical keyboard is currently connected.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   */
  readonly isKeyboardConnected: boolean;

  /**
   * Get list of Windows host names.
   * Returns [] on iOS/Android.
   *
   * @platform Windows (returns [] on iOS/Android)
   */
  readonly hostNames: string[];

  /**
   * Check if Windows tablet mode is active.
   * Returns false on iOS/Android.
   *
   * @platform Windows (returns false on iOS/Android)
   */
  readonly isTabletMode: boolean;
}
