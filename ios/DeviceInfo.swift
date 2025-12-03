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
   * Get the key window using modern scene-based API (iOS 13+)
   * Uses deprecated API on iOS 11-12 for compatibility
   */
  private var keyWindow: UIWindow? {
    if #available(iOS 13.0, *) {
      return UIApplication.shared.connectedScenes
        .compactMap { $0 as? UIWindowScene }
        .flatMap { $0.windows }
        .first { $0.isKeyWindow }
    } else {
      return UIApplication.shared.windows.first
    }
  }

  /**
   * Check if device has a display notch
   * Detects iPhone X and later models with notch
   */
  public func getHasNotch() -> Bool {
    if #available(iOS 11.0, *) {
      guard let window = keyWindow else { return false }
      return window.safeAreaInsets.bottom > 0
    }
    return false
  }

  /**
   * Check if device has Dynamic Island
   * Detects via safe area inset threshold (>= 51pt)
   * Works for iPhone 14 Pro and all future Dynamic Island devices
   */
  public func getHasDynamicIsland() -> Bool {
    // Dynamic Island requires iOS 16.0+
    guard #available(iOS 16.0, *) else {
      return false
    }

    // Only iPhones have Dynamic Island
    guard UIDevice.current.userInterfaceIdiom == .phone else {
      return false
    }

    guard let window = keyWindow else {
      return false
    }

    // Dynamic Island devices have safe area inset >= 51pt
    // Portrait: top = 59pt (51pt with Display Zoom)
    // Landscape: left/right = 59pt
    // Notch devices have 44-48pt in all orientations
    let insets = window.safeAreaInsets
    let maxInset = max(insets.top, insets.left, insets.right)
    return maxInset >= 51
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
  public func getUsedMemory() -> Double {
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
  public func getFreeDiskStorage() -> Double {
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
  public func getBatteryLevel() -> Double {
    // Battery monitoring already enabled in initializer
    _ = batteryMonitoringInitializer
    let level = UIDevice.current.batteryLevel
    return level >= 0 ? Double(level) : 0.0
  }

  /**
   * Get comprehensive power state information
   */
  public func getPowerState() -> PowerState {
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
  public func getIsBatteryCharging() -> Bool {
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
   * Prioritizes IPv4 addresses over IPv6 for compatibility with most applications.
   * Returns IPv6 only as a fallback when no IPv4 address is available.
   */
  public func getIpAddress() throws -> Promise<String> {
    return Promise.async {
      var ipv4Address: String?
      var ipv6Address: String?
      var ifaddr: UnsafeMutablePointer<ifaddrs>?

      if getifaddrs(&ifaddr) == 0 {
        var ptr = ifaddr
        while ptr != nil {
          defer { ptr = ptr?.pointee.ifa_next }

          guard let interface = ptr?.pointee else { continue }

          // Only process en0 (WiFi) and pdp_ip0 (cellular) interfaces
          let name = String(cString: interface.ifa_name)
          guard name == "en0" || name == "pdp_ip0" else { continue }

          // Safe nil check for ifa_addr
          guard let addr = interface.ifa_addr else { continue }
          let addrFamily = addr.pointee.sa_family

          var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
          if getnameinfo(addr, socklen_t(addr.pointee.sa_len),
                        &hostname, socklen_t(hostname.count),
                        nil, socklen_t(0), NI_NUMERICHOST) == 0 {
            let address = String(cString: hostname)

            // Prioritize IPv4 (AF_INET) over IPv6 (AF_INET6)
            if addrFamily == UInt8(AF_INET) {
              // Found IPv4, store it
              ipv4Address = address
            } else if addrFamily == UInt8(AF_INET6) && ipv6Address == nil {
              // Store IPv6 as fallback (only first one found)
              ipv6Address = address
            }
          }
        }
        freeifaddrs(ifaddr)
      }

      // Return IPv4 if available, otherwise IPv6, otherwise "unknown"
      return ipv4Address ?? ipv6Address ?? "unknown"
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
  public func getHasGms() -> Bool {
    return false
  }

  /**
   * Check if Huawei Mobile Services is available (always false on iOS)
   */
  public func getHasHms() -> Bool {
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
  func getIsWiredHeadphonesConnected() -> Bool {
    let route = AVAudioSession.sharedInstance().currentRoute
    return route.outputs.contains { output in
      output.portType == .headphones
    }
  }

  /// Check if Bluetooth headphones are connected
  func getIsBluetoothHeadphonesConnected() -> Bool {
    let route = AVAudioSession.sharedInstance().currentRoute
    return route.outputs.contains { output in
      output.portType == .bluetoothA2DP ||
      output.portType == .bluetoothHFP ||
      output.portType == .bluetoothLE
    }
  }

  /// Check if airplane mode is enabled (not available on iOS - returns false)
  func getIsAirplaneMode() -> Bool {
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
  func getIsLandscape() -> Bool {
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
  func getFontScale() -> Double {
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
  func getAvailableLocationProviders() -> [String] {
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
  func getIpAddressSync() -> String {
    let now = Date().timeIntervalSince1970
    if now - ipAddressCacheTime > IP_CACHE_DURATION {
      cachedIpAddress = queryIpAddressInternal()
      ipAddressCacheTime = now
    }
    return cachedIpAddress
  }

  /// Query IP address from network interfaces
  /// Prioritizes IPv4 addresses over IPv6 for compatibility with most applications.
  /// Returns IPv6 only as a fallback when no IPv4 address is available.
  private func queryIpAddressInternal() -> String {
    var ipv4Address: String?
    var ipv6Address: String?
    var ifaddr: UnsafeMutablePointer<ifaddrs>?

    guard getifaddrs(&ifaddr) == 0 else { return "unknown" }
    guard let firstAddr = ifaddr else { return "unknown" }

    defer { freeifaddrs(ifaddr) }

    for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
      let interface = ptr.pointee

      // Only process en0 (WiFi) and pdp_ip0 (cellular) interfaces
      let name = String(cString: interface.ifa_name)
      guard name == "en0" || name == "pdp_ip0" else { continue }

      // Safe nil check for ifa_addr
      guard let addr = interface.ifa_addr else { continue }
      let addrFamily = addr.pointee.sa_family

      var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
      if getnameinfo(
        addr,
        socklen_t(addr.pointee.sa_len),
        &hostname,
        socklen_t(hostname.count),
        nil,
        0,
        NI_NUMERICHOST
      ) == 0 {
        let address = String(cString: hostname)

        // Prioritize IPv4 (AF_INET) over IPv6 (AF_INET6)
        if addrFamily == UInt8(AF_INET) {
          // Found IPv4, store it
          ipv4Address = address
        } else if addrFamily == UInt8(AF_INET6) && ipv6Address == nil {
          // Store IPv6 as fallback (only first one found)
          ipv6Address = address
        }
      }
    }

    // Return IPv4 if available, otherwise IPv6, otherwise "unknown"
    return ipv4Address ?? ipv6Address ?? "unknown"
  }

  /// Get MAC address (hardcoded on iOS 7+ due to privacy restrictions)
  func getMacAddressSync() -> String {
    return "02:00:00:00:00:00"
  }

  /// Get carrier name with 5-second cache
  func getCarrierSync() -> String {
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
  func getIsLocationEnabled() -> Bool {
    return CLLocationManager.locationServicesEnabled()
  }

  /// Check if any headphones are connected
  func getIsHeadphonesConnected() -> Bool {
    return getIsWiredHeadphonesConnected() || getIsBluetoothHeadphonesConnected()
  }

  // MARK: - iOS-Specific Features

  /// Check if Display Zoom is enabled
  var isDisplayZoomed: Bool {
    let screen = UIScreen.main
    return screen.scale < screen.nativeScale
  }

  /// Get screen brightness (0.0 to 1.0)
  func getBrightness() -> Double {
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
    return getBatteryLevel() < threshold
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
  func getFreeDiskStorageOld() -> Double {
    return getFreeDiskStorage()
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

  // MARK: - Device Integrity / Security

  /**
   * Synchronously checks for jailbreak status
   *
   * Always returns false on simulator for development convenience.
   * Uses fast detection methods only (file system checks, no network/socket operations).
   * For comprehensive checks including SSH port scanning, use `verifyDeviceIntegrity()`.
   */
  func isDeviceCompromised() -> Bool {
    // Simulator exception - for development convenience
    #if targetEnvironment(simulator)
      return false
    #else
      // Fast checks only (no socket operations to avoid blocking)
      return checkJailbreakFiles() ||
             checkJailbreakUrlSchemes() ||
             checkSystemFileWritable() ||
             checkSuspiciousDylibs() ||
             checkSymbolicLinks()
    #endif
  }

  /**
   * Asynchronous integrity verification
   *
   * Performs all local checks including SSH port scanning which may take up to 200ms.
   * Currently local checks only (App Attest may be added in future).
   */
  func verifyDeviceIntegrity() throws -> Promise<Bool> {
    return Promise.async {
      #if targetEnvironment(simulator)
        return false
      #else
        // Include SSH port check in async method (can take up to 200ms)
        return self.checkJailbreakFiles() ||
               self.checkJailbreakUrlSchemes() ||
               self.checkSystemFileWritable() ||
               self.checkSuspiciousDylibs() ||
               self.checkSymbolicLinks() ||
               self.checkSshPorts()
      #endif
    }
  }

  // MARK: - Jailbreak Detection Helpers

  /**
   * Checks for jailbreak-related apps and files
   */
  private func checkJailbreakFiles() -> Bool {
    let jailbreakPaths = [
      // Package manager apps
      "/Applications/Cydia.app",
      "/Applications/Sileo.app",
      "/Applications/Zebra.app",
      "/Applications/Installer.app",
      "/Applications/blackra1n.app",
      "/Applications/FakeCarrier.app",
      "/Applications/Icy.app",
      "/Applications/IntelliScreen.app",
      "/Applications/MxTube.app",
      "/Applications/RockApp.app",
      "/Applications/SBSettings.app",
      "/Applications/WinterBoard.app",
      // System paths
      "/Library/MobileSubstrate/MobileSubstrate.dylib",
      "/Library/MobileSubstrate/DynamicLibraries/",
      "/var/lib/cydia",
      "/var/lib/apt",
      "/var/cache/apt",
      "/var/log/syslog",
      "/bin/bash",
      "/bin/sh",
      "/usr/sbin/sshd",
      "/usr/bin/sshd",
      "/usr/libexec/sftp-server",
      "/etc/apt",
      "/private/var/lib/apt/",
      "/private/var/lib/cydia",
      "/private/var/mobile/Library/SBSettings/Themes",
      "/private/var/stash",
      "/private/var/tmp/cydia.log",
      "/System/Library/LaunchDaemons/com.ikey.bbot.plist",
      "/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist",
      // Jailbreak tools
      "/usr/bin/cycript",
      "/usr/local/bin/cycript",
      "/usr/lib/libcycript.dylib",
      "/var/checkra1n.dmg",
      "/var/binpack"
    ]

    let fileManager = FileManager.default
    for path in jailbreakPaths {
      if fileManager.fileExists(atPath: path) {
        return true
      }
    }
    return false
  }

  /**
   * Checks for jailbreak-related URL schemes
   */
  private func checkJailbreakUrlSchemes() -> Bool {
    let jailbreakSchemes = [
      "cydia://",
      "sileo://",
      "zbra://",       // Zebra
      "filza://",      // Filza file manager
      "activator://"   // Activator tweak
    ]

    for scheme in jailbreakSchemes {
      if let url = URL(string: scheme), UIApplication.shared.canOpenURL(url) {
        return true
      }
    }
    return false
  }

  /**
   * Checks if system files are writable
   */
  private func checkSystemFileWritable() -> Bool {
    let testPaths = [
      "/private/jailbreak.txt",
      "/private/var/mobile/Library/jailbreak.txt"
    ]

    let fileManager = FileManager.default
    let testString = "jailbreak_test"

    for path in testPaths {
      do {
        try testString.write(toFile: path, atomically: true, encoding: .utf8)
        // Write succeeded - delete file and detect jailbreak
        try? fileManager.removeItem(atPath: path)
        return true
      } catch {
        // Write failure is normal (not jailbroken)
      }
    }
    return false
  }

  /**
   * Detects suspicious DYLD injections
   */
  private func checkSuspiciousDylibs() -> Bool {
    let suspiciousDylibs = [
      "MobileSubstrate",
      "SubstrateLoader",
      "SubstrateInserter",
      "SubstrateBootstrap",
      "CydiaSubstrate",
      "cynject",
      "CustomWidgetIcons",
      "PreferenceLoader",
      "RocketBootstrap",
      "weeLoader",
      "/.telegramloaded",
      "libhooker",
      "substrate",
      "TweakInject",
      "bfdecrypt",
      "cycript",
      "pspawn",
      "rocketbootstrap",
      "colors",
      "libcolorpicker"
    ]

    let imageCount = _dyld_image_count()
    for i in 0..<imageCount {
      if let imageName = _dyld_get_image_name(i) {
        let name = String(cString: imageName)
        for suspicious in suspiciousDylibs {
          if name.lowercased().contains(suspicious.lowercased()) {
            return true
          }
        }
      }
    }
    return false
  }

  /**
   * Checks for symbolic links (created during jailbreak)
   */
  private func checkSymbolicLinks() -> Bool {
    let symbolicLinkPaths = [
      "/Applications",
      "/Library/Ringtones",
      "/Library/Wallpaper",
      "/usr/arm-apple-darwin9",
      "/usr/include",
      "/usr/libexec",
      "/usr/share"
    ]

    let fileManager = FileManager.default
    for path in symbolicLinkPaths {
      do {
        let attributes = try fileManager.attributesOfItem(atPath: path)
        if let fileType = attributes[.type] as? FileAttributeType,
           fileType == .typeSymbolicLink {
          return true
        }
      } catch {
        // File not found or inaccessible - normal
      }
    }
    return false
  }

  /**
   * Checks SSH ports (OpenSSH installed during jailbreak)
   */
  private func checkSshPorts() -> Bool {
    let sshPorts = [22, 44]  // 22: OpenSSH, 44: checkra1n

    for port in sshPorts {
      if canConnectToPort(port: port) {
        return true
      }
    }
    return false
  }

  /**
   * Checks if local port is connectable using poll() for better portability
   */
  private func canConnectToPort(port: Int) -> Bool {
    var addr = sockaddr_in()
    addr.sin_family = sa_family_t(AF_INET)
    addr.sin_port = in_port_t(port).bigEndian
    addr.sin_addr.s_addr = inet_addr("127.0.0.1")

    let sock = socket(AF_INET, SOCK_STREAM, 0)
    guard sock != -1 else { return false }
    defer { close(sock) }

    // Set non-blocking mode
    let flags = fcntl(sock, F_GETFL, 0)
    _ = fcntl(sock, F_SETFL, flags | O_NONBLOCK)

    let result = withUnsafePointer(to: &addr) {
      $0.withMemoryRebound(to: sockaddr.self, capacity: 1) {
        connect(sock, $0, socklen_t(MemoryLayout<sockaddr_in>.size))
      }
    }

    if result == 0 {
      return true
    }

    // EINPROGRESS means connection in progress - use poll() to wait
    if errno == EINPROGRESS {
      var pollFd = pollfd(fd: sock, events: Int16(POLLOUT), revents: 0)
      let pollResult = poll(&pollFd, 1, 100)  // 100ms timeout
      return pollResult > 0 && (pollFd.revents & Int16(POLLOUT)) != 0
    }

    return false
  }
}
