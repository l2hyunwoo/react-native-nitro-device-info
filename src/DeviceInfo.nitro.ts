/**
 * Nitro Device Info Module - TypeScript Interface Contract
 *
 * This file defines the complete API surface for the Nitro Device Info module.
 * It will be processed by Nitrogen to generate native bindings.
 *
 * @module react-native-nitro-device-info
 * @version 0.1.0
 * @platform ios 13.4+
 * @platform android API 21+
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
 * This interface exposes all device information methods through Nitro's
 * zero-overhead JSI bindings. Methods are categorized as:
 * - Synchronous (readonly getters): Cached values, <1ms access
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
 * console.log(deviceInfo.systemVersion) // "15.0"
 *
 * // Asynchronous access (Promise-based)
 * const uniqueId = await deviceInfo.getUniqueId()
 * const memory = await deviceInfo.getTotalMemory()
 * ```
 *
 * @platform ios 13.4+
 * @platform android API 21+
 */
export interface DeviceInfo
  extends HybridObject<{ ios: 'swift'; android: 'kotlin' }> {
  // ========================================================================
  // CORE DEVICE INFORMATION (Synchronous)
  // ========================================================================

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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
   */
  readonly deviceType: DeviceType;

  // ========================================================================
  // DEVICE CAPABILITIES (Synchronous)
  // ========================================================================

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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
   */
  hasDynamicIsland(): boolean;

  // ========================================================================
  // DEVICE IDENTIFICATION (Sync)
  // ========================================================================

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
   * @sync <1ms
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
   * @sync <1ms
   */
  getManufacturer(): string;

  // ========================================================================
  // SYSTEM RESOURCES (Sync)
  // ========================================================================

  /**
   * Get total device RAM in bytes
   *
   * Returns the total physical memory available on the device.
   *
   * @returns Total memory in bytes
   * @example 6442450944 (6 GB)
   *
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
   */
  getPowerState(): PowerState;

  /**
   * Check if battery is currently charging
   *
   * @returns true if charging
   * @sync <1ms
   */
  isBatteryCharging(): boolean;

  // ========================================================================
  // APPLICATION METADATA (Sync)
  // ========================================================================

  /**
   * Get application version string
   *
   * @returns Version (e.g., "1.0.0")
   * @example "1.2.3"
   *
   * @sync <1ms
   */
  getVersion(): string;

  /**
   * Get application build number
   *
   * @returns Build number
   * @example "42", "20231025"
   *
   * @sync <1ms
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
   * @sync <1ms
   */
  getBundleId(): string;

  /**
   * Get application display name
   *
   * @returns App name
   * @example "My Awesome App"
   *
   * @sync <1ms
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

  // ========================================================================
  // NETWORK & CONNECTIVITY (Async)
  // ========================================================================

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

  // ========================================================================
  // DEVICE CAPABILITIES (Sync)
  // ========================================================================

  /**
   * Check if camera is present
   *
   * Detects availability of any camera (front or back).
   *
   * @returns true if camera available
   * @sync <1ms
   */
  isCameraPresent(): boolean;

  /**
   * Check if PIN, fingerprint, or Face ID is configured
   *
   * Detects if the device has biometric security set up.
   *
   * @returns true if biometric security set
   * @sync <1ms
   */
  isPinOrFingerprintSet(): boolean;

  /**
   * Check if running in emulator/simulator
   *
   * Detects if the app is running on a simulator (iOS) or
   * emulator (Android) rather than a physical device.
   *
   * @returns true if emulator
   * @sync <1ms
   */
  isEmulator(): boolean;

  // ========================================================================
  // PLATFORM-SPECIFIC (Sync)
  // ========================================================================

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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
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
   * @sync <1ms
   */
  hasHms(): boolean;
}
