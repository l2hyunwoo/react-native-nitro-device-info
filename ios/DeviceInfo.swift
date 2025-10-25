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

  // MARK: - Synchronous Methods

  /**
   * Check if device is a tablet (iPad)
   */
  public func isTablet() throws -> Bool {
    return UIDevice.current.userInterfaceIdiom == .pad
  }

  /**
   * Check if device has a display notch
   * Detects iPhone X and later models with notch
   */
  public func hasNotch() throws -> Bool {
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
  public func hasDynamicIsland() throws -> Bool {
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

  // MARK: - Asynchronous Methods - Device Identification

  /**
   * Get unique device identifier (IDFV)
   * Persists across app installs from same vendor
   */
  public func getUniqueId() throws -> Promise<String> {
    return Promise.async {
      return UIDevice.current.identifierForVendor?.uuidString ?? ""
    }
  }

  /**
   * Get device manufacturer (always "Apple" on iOS)
   */
  public func getManufacturer() throws -> Promise<String> {
    return Promise.async {
      return "Apple"
    }
  }

  // MARK: - Asynchronous Methods - System Resources

  /**
   * Get total device RAM in bytes
   */
  public func getTotalMemory() throws -> Promise<Double> {
    return Promise.async {
      return Double(ProcessInfo.processInfo.physicalMemory)
    }
  }

  /**
   * Get current app memory usage in bytes
   */
  public func getUsedMemory() throws -> Promise<Double> {
    return Promise.async {
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
  }

  /**
   * Get total disk storage capacity in bytes
   */
  public func getTotalDiskCapacity() throws -> Promise<Double> {
    return Promise.async { [logger] in
      do {
        let systemAttributes = try FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory())
        let space = (systemAttributes[.systemSize] as? NSNumber)?.doubleValue ?? 0
        return space
      } catch {
        os_log(.error, log: logger, "Failed to get total disk capacity: %{public}@", error.localizedDescription)
        return 0.0
      }
    }
  }

  /**
   * Get free disk storage in bytes
   */
  public func getFreeDiskStorage() throws -> Promise<Double> {
    return Promise.async { [logger] in
      do {
        let systemAttributes = try FileManager.default.attributesOfFileSystem(forPath: NSHomeDirectory())
        let freeSpace = (systemAttributes[.systemFreeSize] as? NSNumber)?.doubleValue ?? 0
        return freeSpace
      } catch {
        os_log(.error, log: logger, "Failed to get free disk storage: %{public}@", error.localizedDescription)
        return 0.0
      }
    }
  }

  /**
   * Get current battery level (0.0 to 1.0)
   */
  public func getBatteryLevel() throws -> Promise<Double> {
    return Promise.async { [batteryMonitoringInitializer] in
      // Battery monitoring already enabled in initializer
      _ = batteryMonitoringInitializer
      let level = UIDevice.current.batteryLevel
      return level >= 0 ? Double(level) : 0.0
    }
  }

  /**
   * Get comprehensive power state information
   */
  public func getPowerState() throws -> Promise<PowerState> {
    return Promise.async { [batteryMonitoringInitializer] in
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
  }

  /**
   * Check if battery is currently charging
   */
  public func isBatteryCharging() throws -> Promise<Bool> {
    return Promise.async { [batteryMonitoringInitializer] in
      // Battery monitoring already enabled in initializer
      _ = batteryMonitoringInitializer
      return UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
    }
  }

  // MARK: - Asynchronous Methods - Application Metadata

  /**
   * Get application version string
   */
  public func getVersion() throws -> Promise<String> {
    return Promise.async {
      return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
    }
  }

  /**
   * Get application build number
   */
  public func getBuildNumber() throws -> Promise<String> {
    return Promise.async {
      return Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? ""
    }
  }

  /**
   * Get bundle identifier
   */
  public func getBundleId() throws -> Promise<String> {
    return Promise.async {
      return Bundle.main.bundleIdentifier ?? ""
    }
  }

  /**
   * Get application display name
   */
  public func getApplicationName() throws -> Promise<String> {
    return Promise.async {
      return Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ??
             Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? ""
    }
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

  // MARK: - Asynchronous Methods - Device Capabilities

  /**
   * Check if camera is present
   */
  public func isCameraPresent() throws -> Promise<Bool> {
    return Promise.async {
      // Requires AVFoundation import
      // For MVP, return true (all iPhones have cameras)
      return true
    }
  }

  /**
   * Check if PIN or biometric authentication is set
   */
  public func isPinOrFingerprintSet() throws -> Promise<Bool> {
    return Promise.async {
      // Requires LocalAuthentication import
      // For MVP, return false
      return false
    }
  }

  /**
   * Check if running in simulator
   */
  public func isEmulator() throws -> Promise<Bool> {
    return Promise.async {
      #if targetEnvironment(simulator)
        return true
      #else
        return false
      #endif
    }
  }

  // MARK: - Asynchronous Methods - Platform-Specific

  /**
   * Get Android API level (returns -1 on iOS)
   */
  public func getApiLevel() throws -> Promise<Double> {
    return Promise.async {
      return -1.0
    }
  }

  /**
   * Get supported CPU architectures
   */
  public func getSupportedAbis() throws -> Promise<[String]> {
    return Promise.async {
      #if arch(arm64)
        return ["arm64"]
      #elseif arch(x86_64)
        return ["x86_64"]
      #else
        return ["unknown"]
      #endif
    }
  }

  /**
   * Check if Google Mobile Services is available (always false on iOS)
   */
  public func hasGms() throws -> Promise<Bool> {
    return Promise.async {
      return false
    }
  }

  /**
   * Check if Huawei Mobile Services is available (always false on iOS)
   */
  public func hasHms() throws -> Promise<Bool> {
    return Promise.async {
      return false
    }
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
}
