/**
 * DeviceInfo.swift
 * React Native Nitro Device Info - iOS Implementation
 *
 * Implements the DeviceInfo HybridObject for iOS devices.
 * Provides comprehensive device information through Nitro's JSI bindings.
 *
 * @author HyunWoo Lee
 * @version 0.1.0
 */

import Foundation
import UIKit
import NitroModules
import os.log
import AVFoundation
import CoreTelephony
import CoreLocation
import CryptoKit
import DeviceCheck
import WebKit

/**
 * Main implementation of DeviceInfo for iOS
 *
 * This class provides all device information methods for iOS devices,
 * using UIDevice, UIScreen, Bundle, and other iOS frameworks.
 */
class DeviceInfo: HybridDeviceInfoSpec {

  // MARK: - Memory Optimization - Lazy Cached Values

  /**
   * Cached device model identifier to avoid repeated syscall overhead
   */
  private lazy var cachedDeviceModelIdentifier: String = {
    return getDeviceModelIdentifier()
  }()

  /**
   * Enable battery monitoring once and keep it enabled
   * Reduces overhead from repeatedly enabling/disabling
   */
  private let batteryMonitoringInitializer: Void = {
    UIDevice.current.isBatteryMonitoringEnabled = true
  }()

  /**
   * Logger for error and diagnostic logging
   */
  private let logger = OSLog(subsystem: "com.nitro.deviceinfo", category: "DeviceInfo")

  /**
   * Network info caches with periodic refresh (5 second cache)
   */
  private var cachedUserAgent: String?
  private var cachedIpAddress: String = "unknown"
  private var ipAddressCacheTime: TimeInterval = 0
  private var cachedCarrier: String = "unknown"
  private var carrierCacheTime: TimeInterval = 0
  private let IP_CACHE_DURATION: TimeInterval = 5.0
  private let CARRIER_CACHE_DURATION: TimeInterval = 5.0

  // MARK: - Synchronous Properties (Cached Values)

  /**
   * Device model identifier (e.g., "iPhone14,2")
   * Cached value from UIDevice
   */
  public var deviceId: String {
    return cachedDeviceModelIdentifier
  }

  /**
   * Device brand (always "Apple" on iOS)
   */
  public var brand: String {
    return "Apple"
  }

  /**
   * Operating system name
   * Returns "iOS" or "iPadOS" depending on device
   */
  public var systemName: String {
    return UIDevice.current.systemName
  }

  /**
   * Operating system version (e.g., "15.0")
   */
  public var systemVersion: String {
    return UIDevice.current.systemVersion
  }

  /**
   * Device model name (e.g., "iPhone", "iPad")
   */
  public var model: String {
    return UIDevice.current.model
  }

  /**
   * Device type category
   * Determined from UIUserInterfaceIdiom
   */
  public var deviceType: DeviceType {
    switch UIDevice.current.userInterfaceIdiom {
    case .phone:
      return .handset
    case .pad:
      return .tablet
    case .tv:
      return .tv
    case .mac:
      return .desktop
    default:
      return .unknown
    }
  }

  // MARK: - Synchronous Properties - Device Capabilities

  /**
   * Check if device is a tablet (iPad)
   */
  public var isTablet: Bool {
    return UIDevice.current.userInterfaceIdiom == .pad
  }

  /**
   * Check if device has a display notch
   * Detects iPhone X and later models with notch
   */
  public var hasNotch: Bool {
    if #available(iOS 11.0, *) {
      let window = UIApplication.shared.windows.first
      let bottomInset = window?.safeAreaInsets.bottom ?? 0
      return bottomInset > 0
    }
    return false
  }

  /**
   * Check if device has Dynamic Island
   * Only iPhone 14 Pro and later
   */
  public var hasDynamicIsland: Bool {
    if #available(iOS 16.0, *) {
      // Use cached model identifier to avoid repeated syscalls
      let modelIdentifier = cachedDeviceModelIdentifier
      // iPhone 14 Pro models: iPhone15,2 and iPhone15,3
      // iPhone 15 Pro models: iPhone16,1 and iPhone16,2
      return modelIdentifier == "iPhone15,2" ||
             modelIdentifier == "iPhone15,3" ||
             modelIdentifier == "iPhone16,1" ||
             modelIdentifier == "iPhone16,2"
    }
    return false
  }

  // MARK: - Synchronous Properties - Device Identification

  /**
   * Get unique device identifier (IDFV)
   * Persists across app installs from same vendor
   */
  public var uniqueId: String {
    return UIDevice.current.identifierForVendor?.uuidString ?? ""
  }

  /**
   * Get device manufacturer (always "Apple" on iOS)
   */
  public var manufacturer: String {
    return "Apple"
  }

  // MARK: - Synchronous Properties - System Resources

  /**
   * Get total device RAM in bytes
   */
  public var totalMemory: Double {
    return Double(ProcessInfo.processInfo.physicalMemory)
  }

  /**
   * Get current app memory usage in bytes
   */
  public var usedMemory: Double {
    var info = mach_task_basic_info()
    var count = mach_msg_type_number_t(MemoryLayout<mach_task_basic_info>.size)/4

    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
      $0.withMemoryRebound(to: integer_t.self, capacity: 1) {
        task_info(mach_task_self_,
                 task_flavor_t(MACH_TASK_BASIC_INFO),
                 $0,
                 &count)
      }
    }

    if kerr == KERN_SUCCESS {
      return Double(info.resident_size)
    }
    return 0.0
  }

  /**
   * Get total disk storage capacity in bytes
   */
  public var totalDiskCapacity: Double {
    do {
      let systemAttributes = try FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory())
      let space = (systemAttributes[.systemSize] as? NSNumber)?.doubleValue ?? 0
      return space
    } catch {
      os_log(.error, log: logger, "Failed to get total disk capacity: %{public}@", error.localizedDescription)
      return 0.0
    }
  }

  /**
   * Get free disk storage in bytes
   */
  public var freeDiskStorage: Double {
    do {
      let systemAttributes = try FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory())
      let freeSpace = (systemAttributes[.systemFreeSize] as? NSNumber)?.doubleValue ?? 0
      return freeSpace
    } catch {
      os_log(.error, log: logger, "Failed to get free disk storage: %{public}@", error.localizedDescription)
      return 0.0
    }
  }

  /**
   * Get current battery level (0.0 to 1.0)
   */
  public var batteryLevel: Double {
    // Battery monitoring already enabled in initializer
    _ = batteryMonitoringInitializer
    let level = UIDevice.current.batteryLevel
    return level >= 0 ? Double(level) : 0.0
  }

  /**
   * Get comprehensive power state information
   */
  public var powerState: PowerState {
    // Battery monitoring already enabled in initializer
    _ = batteryMonitoringInitializer

    let batteryLevel = UIDevice.current.batteryLevel >= 0 ? Double(UIDevice.current.batteryLevel) : 0.0
    let batteryState = self.getBatteryStateEnum(UIDevice.current.batteryState)

    var lowPowerMode = false
    if #available(iOS 9.0, *) {
      lowPowerMode = ProcessInfo.processInfo.isLowPowerModeEnabled
    }

    return PowerState(
      batteryLevel: batteryLevel,
      batteryState: batteryState,
      lowPowerMode: lowPowerMode
    )
  }

  /**
   * Check if battery is currently charging
   */
  public var isBatteryCharging: Bool {
    // Battery monitoring already enabled in initializer
    _ = batteryMonitoringInitializer
    return UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
  }

  // MARK: - Synchronous Properties - Application Metadata

  /**
   * Get application version string
   */
  public var version: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
  }

  /**
   * Get application build number
   */
  public var buildNumber: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? ""
  }

  /**
   * Get bundle identifier
   */
  public var bundleId: String {
    return Bundle.main.bundleIdentifier ?? ""
  }

  /**
   * Get application display name
   */
  public var applicationName: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ??
           Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? ""
  }

  /**
   * Get first install timestamp (milliseconds since epoch)
   */
  public func getFirstInstallTime() throws -> Promise<Double> {
    return Promise.async {
      if let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        do {
          let attributes = try FileManager.default.attributesOfItem(atPath: documentsURL.path)
          if let creationDate = attributes[.creationDate] as? Date {
            return creationDate.timeIntervalSince1970 * 1000
          }
        } catch {}
      }
      return 0.0
    }
  }

  /**
   * Get last update timestamp (milliseconds since epoch)
   */
  public func getLastUpdateTime() throws -> Promise<Double> {
    return Promise.async {
      if let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first {
        do {
          let attributes = try FileManager.default.attributesOfItem(atPath: documentsURL.path)
          if let modificationDate = attributes[.modificationDate] as? Date {
            return modificationDate.timeIntervalSince1970 * 1000
          }
        } catch {}
      }
      return 0.0
    }
  }

  // MARK: - Asynchronous Methods - Network & Connectivity

  /**
   * Get device IP address
   */
  public func getIpAddress() throws -> Promise<String> {
    return Promise.async {
      var address = ""
      var ifaddr: UnsafeMutablePointer<ifaddrs>?

      if getifaddrs(&ifaddr) == 0 {
        var ptr = ifaddr
        while ptr != nil {
          defer { ptr = ptr?.pointee.ifa_next }

          let interface = ptr?.pointee
          let addrFamily = interface?.ifa_addr.pointee.sa_family

          if addrFamily == UInt8(AF_INET) || addrFamily == UInt8(AF_INET6) {
            let name = String(cString: (interface?.ifa_name)!)
            if name == "en0" || name == "pdp_ip0" {
              var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
              getnameinfo(interface?.ifa_addr, socklen_t((interface?.ifa_addr.pointee.sa_len)!),
                         &hostname, socklen_t(hostname.count),
                         nil, socklen_t(0), NI_NUMERICHOST)
              address = String(cString: hostname)
            }
          }
        }
        freeifaddrs(ifaddr)
      }

      return address
    }
  }

  /**
   * Get MAC address (hardcoded on iOS 7+ due to privacy restrictions)
   */
  public func getMacAddress() throws -> Promise<String> {
    return Promise.async {
      return "02:00:00:00:00:00"
    }
  }

  /**
   * Get cellular carrier name
   */
  public func getCarrier() throws -> Promise<String> {
    return Promise.async {
      if #available(iOS 12.0, *) {
        // Carrier info requires CoreTelephony import
        // For MVP, return empty string
        return ""
      }
      return ""
    }
  }

  /**
   * Check if location services are enabled
   */
  public func isLocationEnabled() throws -> Promise<Bool> {
    return Promise.async {
      // Requires CoreLocation import
      // For MVP, return false
      return false
    }
  }

  /**
   * Check if headphones are connected
   */
  public func isHeadphonesConnected() throws -> Promise<Bool> {
    return Promise.async {
      // Requires AVFoundation import
      // For MVP, return false
      return false
    }
  }

  // MARK: - Synchronous Properties - Device Capabilities (Additional)

  /**
   * Check if camera is present
   */
  public var isCameraPresent: Bool {
    // Requires AVFoundation import
    // For MVP, return true (all iPhones have cameras)
    return true
  }

  /**
   * Check if PIN or biometric authentication is set
   */
  public var isPinOrFingerprintSet: Bool {
    // Requires LocalAuthentication import
    // For MVP, return false
    return false
  }

  /**
   * Check if running in simulator
   */
  public var isEmulator: Bool {
    #if targetEnvironment(simulator)
      return true
    #else
      return false
    #endif
  }

  // MARK: - Synchronous Properties - Platform-Specific

  /**
   * Get Android API level (returns -1 on iOS)
   */
  public var apiLevel: Double {
    return -1.0
  }

  /**
   * Get supported CPU architectures
   */
  public var supportedAbis: [String] {
    #if arch(arm64)
      return ["arm64"]
    #elseif arch(x86_64)
      return ["x86_64"]
    #else
      return ["unknown"]
    #endif
  }

  /**
   * Check if Google Mobile Services is available (always false on iOS)
   */
  public var hasGms: Bool {
    return false
  }

  /**
   * Check if Huawei Mobile Services is available (always false on iOS)
   */
  public var hasHms: Bool {
    return false
  }

  // MARK: - Helper Methods

  /**
   * Get device model identifier using sysctlbyname
   */
  private func getDeviceModelIdentifier() -> String {
    var systemInfo = utsname()
    uname(&systemInfo)
    let machineMirror = Mirror(reflecting: systemInfo.machine)
    let identifier = machineMirror.children.reduce("") { identifier, element in
      guard let value = element.value as? Int8, value != 0 else { return identifier }
      return identifier + String(UnicodeScalar(UInt8(value)))
    }
    return identifier
  }

  /**
   * Convert UIDevice.BatteryState to BatteryState enum
   */
  private func getBatteryStateEnum(_ state: UIDevice.BatteryState) -> BatteryState {
    switch state {
    case .unknown:
      return .unknown
    case .unplugged:
      return .unplugged
    case .charging:
      return .charging
    case .full:
      return .full
    @unknown default:
      return .unknown
    }
  }

  // MARK: - Android Build Information (Cross-Platform Defaults for iOS)

  /// Android device serial number (iOS returns "unknown")
  var serialNumber: String { "unknown" }

  /// Android ID (iOS returns "unknown")
  var androidId: String { "unknown" }

  /// Android security patch level (iOS returns "unknown")
  var securityPatch: String { "unknown" }

  /// Device bootloader version (iOS returns "unknown")
  var bootloader: String { "unknown" }

  /// Android OS version codename (iOS returns "unknown")
  var codename: String { "unknown" }

  /// Device codename (iOS returns "unknown")
  var device: String { "unknown" }

  /// Build display ID (iOS returns "unknown")
  var display: String { "unknown" }

  /// Build fingerprint (iOS returns "unknown")
  var fingerprint: String { "unknown" }

  /// Hardware name (iOS returns "unknown")
  var hardware: String { "unknown" }

  /// Build host (iOS returns "unknown")
  var host: String { "unknown" }

  /// Product name (iOS returns "unknown")
  var product: String { "unknown" }

  /// Build tags (iOS returns "unknown")
  var tags: String { "unknown" }

  /// Build type (iOS returns "unknown")
  var type: String { "unknown" }

  /// Base OS version (iOS returns empty string)
  var baseOs: String { "" }

  /// Preview SDK version (iOS returns 0)
  var previewSdkInt: Double { 0.0 }

  /// Incremental version (iOS returns "unknown")
  var incremental: String { "unknown" }

  /// Build ID (iOS returns "unknown")
  var buildId: String { "unknown" }

  // MARK: - Application Installation Metadata

  /// Installer package name (App Store, TestFlight, or unknown)
  var installerPackageName: String {
    if let receiptURL = Bundle.main.appStoreReceiptURL {
      let receiptPath = receiptURL.path
      if receiptPath.contains("sandboxReceipt") {
        return "com.apple.TestFlight"
      } else if receiptPath.contains("receipt") {
        return "com.apple.AppStore"
      }
    }
    return "unknown"
  }

  /// Get install referrer (Android-specific, returns "unknown" on iOS)
  func getInstallReferrer() throws -> Promise<String> {
    return Promise.async {
      return "unknown"
    }
  }

  /// Device boot time in milliseconds since epoch
  var startupTime: Double {
    let uptime = ProcessInfo.processInfo.systemUptime
    let bootTime = Date().timeIntervalSince1970 - uptime
    return bootTime * 1000
  }

  /// Readable version string (version.build)
  var readableVersion: String {
    return "\(version).\(buildNumber)"
  }

  /// Cached first install time (computed once)
  private lazy var cachedFirstInstallTime: Double = {
    if let documentsURL = FileManager.default.urls(
      for: .documentDirectory,
      in: .userDomainMask
    ).first {
      do {
        let attributes = try FileManager.default.attributesOfItem(
          atPath: documentsURL.path
        )
        if let creationDate = attributes[.creationDate] as? Date {
          return creationDate.timeIntervalSince1970 * 1000
        }
      } catch {
        // Handle error silently
      }
    }
    return 0.0
  }()

  /// First install time in milliseconds since epoch
  var firstInstallTimeSync: Double {
    return cachedFirstInstallTime
  }

  /// Last update time (not available on iOS, returns -1)
  var lastUpdateTimeSync: Double {
    return -1
  }

  // MARK: - Device Capability Detection

  /// Check if wired headphones are connected
  var isWiredHeadphonesConnected: Bool {
    do {
      let route = AVAudioSession.sharedInstance().currentRoute
      return route.outputs.contains { output in
        output.portType == .headphones
      }
    } catch {
      // Handle error silently and return false
      return false
    }
  }

  /// Check if Bluetooth headphones are connected
  var isBluetoothHeadphonesConnected: Bool {
    let route = AVAudioSession.sharedInstance().currentRoute
    return route.outputs.contains { output in
      output.portType == .bluetoothA2DP ||
      output.portType == .bluetoothHFP ||
      output.portType == .bluetoothLE
    }
  }

  /// Check if airplane mode is enabled (not available on iOS - returns false)
  var isAirplaneMode: Bool {
    return false
  }

  /// Check if device is low RAM device (iOS doesn't have equivalent - returns false)
  var isLowRamDevice: Bool {
    return false
  }

  /// Check if mouse is connected (Windows-specific, returns false on iOS)
  var isMouseConnected: Bool {
    return false
  }

  /// Check if keyboard is connected (Windows-specific, returns false on iOS)
  var isKeyboardConnected: Bool {
    return false
  }

  /// Check if device is in landscape orientation
  var isLandscape: Bool {
    let orientation = UIDevice.current.orientation
    return orientation == .landscapeLeft || orientation == .landscapeRight
  }

  // MARK: - Advanced System Information

  /// Get supported 32-bit ABIs (iOS devices are 64-bit only since iPhone 5s)
  var supported32BitAbis: [String] {
    return []
  }

  /// Get supported 64-bit ABIs
  var supported64BitAbis: [String] {
    var arch: String = "arm64"

    #if targetEnvironment(simulator)
      #if arch(x86_64)
        arch = "x86_64"
      #elseif arch(arm64)
        arch = "arm64"  // Apple Silicon Macs
      #endif
    #endif

    return [arch]
  }

  /// Get system font scale
  var fontScale: Double {
    let preferredFont = UIFont.preferredFont(forTextStyle: .body)
    let defaultSize: CGFloat = 17.0  // iOS default body font size
    return Double(preferredFont.pointSize / defaultSize)
  }

  /// Check if system has a feature (Android-specific, not available on iOS)
  func hasSystemFeature(feature: String) -> Bool {
    return false
  }

  /// Get system available features (Android-specific, not available on iOS)
  var systemAvailableFeatures: [String] {
    return []
  }

  /// Get list of enabled location providers
  var availableLocationProviders: [String] {
    let enabled = CLLocationManager.locationServicesEnabled()
    if enabled {
      return ["gps", "network"]
    } else {
      return []
    }
  }

  /// Get host names (Windows-specific, not available on iOS)
  var hostNames: [String] {
    return []
  }

  /// Get maximum memory (not available on iOS in same way as Android)
  var maxMemory: Double {
    return -1
  }

  // MARK: - Network & Display Information

  /// Get WebView user agent string (cached after first call)
  func getUserAgent() throws -> Promise<String> {
    return Promise.async { [weak self] in
      if let cached = self?.cachedUserAgent {
        return cached
      }

      return await withCheckedContinuation { (continuation: CheckedContinuation<String, Never>) in
        DispatchQueue.main.async { [weak self] in
          let webView = WKWebView()
          webView.evaluateJavaScript("navigator.userAgent") { result, error in
            if let userAgent = result as? String {
              self?.cachedUserAgent = userAgent
              continuation.resume(returning: userAgent)
            } else {
              continuation.resume(returning: "unknown")
            }
          }
        }
      }
    }
  }

  /// Get device name
  var deviceName: String {
    return UIDevice.current.name
  }

  /// Get device token from DeviceCheck
  func getDeviceToken() throws -> Promise<String> {
    return Promise.async {
      if #available(iOS 11.0, *) {
        return try await withCheckedThrowingContinuation { continuation in
          DCDevice.current.generateToken { data, error in
            if let data = data {
              let token = data.base64EncodedString()
              continuation.resume(returning: token)
            } else if let error = error {
              continuation.resume(throwing: error)
            } else {
              continuation.resume(throwing: NSError(
                domain: "DeviceInfo",
                code: -1,
                userInfo: [NSLocalizedDescriptionKey: "Unknown error generating token"]
              ))
            }
          }
        }
      } else {
        throw NSError(
          domain: "DeviceInfo",
          code: -2,
          userInfo: [NSLocalizedDescriptionKey: "DeviceCheck requires iOS 11.0+"]
        )
      }
    }
  }

  /// Get IP address with 5-second cache
  var ipAddressSync: String {
    let now = Date().timeIntervalSince1970
    if now - ipAddressCacheTime > IP_CACHE_DURATION {
      cachedIpAddress = queryIpAddressInternal()
      ipAddressCacheTime = now
    }
    return cachedIpAddress
  }

  /// Query IP address from network interfaces
  private func queryIpAddressInternal() -> String {
    var address: String = "unknown"
    var ifaddr: UnsafeMutablePointer<ifaddrs>?

    guard getifaddrs(&ifaddr) == 0 else { return address }
    guard let firstAddr = ifaddr else { return address }

    defer { freeifaddrs(ifaddr) }

    for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
      let interface = ptr.pointee
      let addrFamily = interface.ifa_addr.pointee.sa_family

      if addrFamily == UInt8(AF_INET) || addrFamily == UInt8(AF_INET6) {
        let name = String(cString: interface.ifa_name)
        if name == "en0" || name == "pdp_ip0" {
          var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
          if getnameinfo(
            interface.ifa_addr,
            socklen_t(interface.ifa_addr.pointee.sa_len),
            &hostname,
            socklen_t(hostname.count),
            nil,
            0,
            NI_NUMERICHOST
          ) == 0 {
            address = String(cString: hostname)
            break
          }
        }
      }
    }

    return address
  }

  /// Get MAC address (hardcoded on iOS 7+ due to privacy restrictions)
  var macAddressSync: String {
    return "02:00:00:00:00:00"
  }

  /// Get carrier name with 5-second cache
  var carrierSync: String {
    let now = Date().timeIntervalSince1970
    if now - carrierCacheTime > CARRIER_CACHE_DURATION {
      let networkInfo = CTTelephonyNetworkInfo()
      // serviceSubscriberCellularProviders is available on iOS 12.0+
      if let providers = networkInfo.serviceSubscriberCellularProviders,
         let carrier = providers.values.first {
        cachedCarrier = carrier.carrierName ?? "unknown"
      } else {
        cachedCarrier = "unknown"
      }
      carrierCacheTime = now
    }
    return cachedCarrier
  }

  /// Check if location services are enabled
  var isLocationEnabledSync: Bool {
    return CLLocationManager.locationServicesEnabled()
  }

  /// Check if any headphones are connected
  var isHeadphonesConnectedSync: Bool {
    return isWiredHeadphonesConnected || isBluetoothHeadphonesConnected
  }

  // MARK: - iOS-Specific Features

  /// Check if Display Zoom is enabled
  var isDisplayZoomed: Bool {
    let screen = UIScreen.main
    return screen.scale < screen.nativeScale
  }

  /// Get screen brightness (0.0 to 1.0)
  var brightness: Double {
    return Double(UIScreen.main.brightness)
  }

  /// Get unique ID and sync to Keychain for persistence
  func syncUniqueId() throws -> Promise<String> {
    return Promise.async {
      let uniqueId = self.uniqueId

      let keychainQuery: [String: Any] = [
        kSecClass as String: kSecClassGenericPassword,
        kSecAttrAccount as String: "uniqueDeviceId",
        kSecAttrService as String: Bundle.main.bundleIdentifier ?? "DeviceInfo",
        kSecValueData as String: uniqueId.data(using: .utf8)!
      ]

      var status = SecItemAdd(keychainQuery as CFDictionary, nil)

      if status == errSecDuplicateItem {
        let updateQuery: [String: Any] = [
          kSecClass as String: kSecClassGenericPassword,
          kSecAttrAccount as String: "uniqueDeviceId",
          kSecAttrService as String: Bundle.main.bundleIdentifier ?? "DeviceInfo"
        ]
        let updateAttributes: [String: Any] = [
          kSecValueData as String: uniqueId.data(using: .utf8)!
        ]
        status = SecItemUpdate(updateQuery as CFDictionary, updateAttributes as CFDictionary)
      }

      return uniqueId
    }
  }

  // MARK: - Media & Battery Helpers

  /// Get supported media types (Android-specific, returns empty on iOS)
  var supportedMediaTypeList: [String] {
    return []
  }

  /// Check if battery level is below threshold
  func isLowBatteryLevel(threshold: Double) -> Bool {
    return batteryLevel < threshold
  }

  /// Check if device is in tablet mode (Windows-specific, returns false on iOS)
  var isTabletMode: Bool {
    return false
  }

  /// Get total disk capacity using old API (alias to main method on iOS)
  var totalDiskCapacityOld: Double {
    return totalDiskCapacity
  }

  /// Get free disk storage using old API (alias to main method on iOS)
  var freeDiskStorageOld: Double {
    return freeDiskStorage
  }

  /// Check if liquid glass effect is available
  /// Requires iOS 26.0+, Xcode 16+ (Swift 6.2+), and UIDesignRequiresCompatibility must be false/absent
  var isLiquidGlassAvailable: Bool {
    #if compiler(>=6.2)  // Xcode 16+ with Swift 6.2+
    if #available(iOS 26.0, *) {
      // Check if the app has explicitly disabled liquid glass via compatibility flag
      if let infoPlist = Bundle.main.infoDictionary,
         let requiresCompatibility = infoPlist["UIDesignRequiresCompatibility"] as? Bool {
        // If UIDesignRequiresCompatibility is true, liquid glass is disabled
        return !requiresCompatibility
      }
      // If the flag is not set or is false, liquid glass is available
      return true
    }
    #endif
    // Liquid glass requires iOS 26.0+ and Swift 6.2+ compiler
    return false
  }

  /// Check if hardware-backed key storage (Secure Enclave) is available
  var isHardwareKeyStoreAvailable: Bool {
    #if targetEnvironment(simulator)
      // iOS Simulator does not have Secure Enclave
      return false
    #else
      // SecureEnclave.isAvailable checks for A7+ chip (iPhone 5s+)
      return SecureEnclave.isAvailable
    #endif
  }

  // MARK: - Localization & Navigation

  /// Get device system language in BCP 47 format
  /// Returns the user's preferred language, reflects per-app language settings on iOS 13.1+
  var systemLanguage: String {
    return Locale.preferredLanguages.first ?? "en"
  }

  /// Get navigation mode (iOS always returns "unknown" - no configurable navigation modes)
  var navigationMode: NavigationMode {
    return .unknown
  }
}
