import Foundation
import UIKit
import NitroModules
import os.log
import AVFoundation
import LocalAuthentication
import CoreTelephony
import CoreLocation
import CryptoKit
import DeviceCheck
import WebKit

class DeviceInfo: HybridDeviceInfoSpec {

  // MARK: - Private Properties & Caches

  private lazy var cachedDeviceModelIdentifier: String = {
    return getDeviceModelIdentifier()
  }()

  /// Enable battery monitoring once and keep it enabled
  private let batteryMonitoringInitializer: Void = {
    UIDevice.current.isBatteryMonitoringEnabled = true
  }()

  private let logger = OSLog(subsystem: "com.nitro.deviceinfo", category: "DeviceInfo")

  private var cachedUserAgent: String?
  private var cachedIpAddress: String = "unknown"
  private var ipAddressCacheTime: TimeInterval = 0
  private var cachedCarrier: String = "unknown"
  private var carrierCacheTime: TimeInterval = 0
  private let IP_CACHE_DURATION: TimeInterval = 5.0
  private let CARRIER_CACHE_DURATION: TimeInterval = 5.0

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
      }
    }
    return 0.0
  }()

  private lazy var cachedDeviceYearClass: Double = {
    let totalRam = Double(ProcessInfo.processInfo.physicalMemory)
    let MB: Double = 1024 * 1024

    if totalRam <= 512 * MB {
      return 2010 // iPhone 4 and earlier
    } else if totalRam <= 1024 * MB {
      return 2012 // iPhone 5, 5c
    } else if totalRam <= 2048 * MB {
      return 2014 // iPhone 6, 6s
    } else if totalRam <= 3072 * MB {
      return 2016 // iPhone 7, 8
    } else if totalRam <= 4096 * MB {
      return 2018 // iPhone XS, 11
    } else if totalRam <= 6144 * MB {
      return 2020 // iPhone 12, 13
    } else if totalRam <= 8192 * MB {
      return 2022 // iPhone 14 Pro, 15 Pro
    } else {
      return 2024 // 8GB+ (iPhone 16 Pro, future devices)
    }
  }()

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

  private var cachedCarrierObject: CTCarrier? {
    let networkInfo = CTTelephonyNetworkInfo()
    if let providers = networkInfo.serviceSubscriberCellularProviders {
      return providers.values.first
    }
    return nil
  }

  // MARK: - Core Device Information

  public var deviceId: String {
    return cachedDeviceModelIdentifier
  }

  public var brand: String {
    return "Apple"
  }

  public var model: String {
    let id = cachedDeviceModelIdentifier

    if let name = Self.deviceNamesByCode[id] {
      return name
    }

    // Fallback to generic name for unknown/future devices
    if id.hasPrefix("iPhone") { return "iPhone" }
    if id.hasPrefix("iPad") { return "iPad" }
    if id.hasPrefix("iPod") { return "iPod Touch" }
    if id.hasPrefix("AppleTV") { return "Apple TV" }
    if id.hasPrefix("RealityDevice") { return "Apple Vision" }

    return UIDevice.current.model
  }

  // MARK: - Device Model Mapping

  private static let deviceNamesByCode: [String: String] = [
    // MARK: iPhone
    "iPhone1,1": "iPhone",
    "iPhone1,2": "iPhone 3G",
    "iPhone2,1": "iPhone 3GS",
    "iPhone3,1": "iPhone 4",
    "iPhone3,2": "iPhone 4",
    "iPhone3,3": "iPhone 4",
    "iPhone4,1": "iPhone 4S",
    "iPhone5,1": "iPhone 5",
    "iPhone5,2": "iPhone 5",
    "iPhone5,3": "iPhone 5c",
    "iPhone5,4": "iPhone 5c",
    "iPhone6,1": "iPhone 5s",
    "iPhone6,2": "iPhone 5s",
    "iPhone7,1": "iPhone 6 Plus",
    "iPhone7,2": "iPhone 6",
    "iPhone8,1": "iPhone 6s",
    "iPhone8,2": "iPhone 6s Plus",
    "iPhone8,4": "iPhone SE",
    "iPhone9,1": "iPhone 7",
    "iPhone9,2": "iPhone 7 Plus",
    "iPhone9,3": "iPhone 7",
    "iPhone9,4": "iPhone 7 Plus",
    "iPhone10,1": "iPhone 8",
    "iPhone10,2": "iPhone 8 Plus",
    "iPhone10,3": "iPhone X",
    "iPhone10,4": "iPhone 8",
    "iPhone10,5": "iPhone 8 Plus",
    "iPhone10,6": "iPhone X",
    "iPhone11,2": "iPhone XS",
    "iPhone11,4": "iPhone XS Max",
    "iPhone11,6": "iPhone XS Max",
    "iPhone11,8": "iPhone XR",
    "iPhone12,1": "iPhone 11",
    "iPhone12,3": "iPhone 11 Pro",
    "iPhone12,5": "iPhone 11 Pro Max",
    "iPhone12,8": "iPhone SE (2nd generation)",
    "iPhone13,1": "iPhone 12 mini",
    "iPhone13,2": "iPhone 12",
    "iPhone13,3": "iPhone 12 Pro",
    "iPhone13,4": "iPhone 12 Pro Max",
    "iPhone14,2": "iPhone 13 Pro",
    "iPhone14,3": "iPhone 13 Pro Max",
    "iPhone14,4": "iPhone 13 mini",
    "iPhone14,5": "iPhone 13",
    "iPhone14,6": "iPhone SE (3rd generation)",
    "iPhone14,7": "iPhone 14",
    "iPhone14,8": "iPhone 14 Plus",
    "iPhone15,2": "iPhone 14 Pro",
    "iPhone15,3": "iPhone 14 Pro Max",
    "iPhone15,4": "iPhone 15",
    "iPhone15,5": "iPhone 15 Plus",
    "iPhone16,1": "iPhone 15 Pro",
    "iPhone16,2": "iPhone 15 Pro Max",
    "iPhone17,1": "iPhone 16 Pro",
    "iPhone17,2": "iPhone 16 Pro Max",
    "iPhone17,3": "iPhone 16",
    "iPhone17,4": "iPhone 16 Plus",
    "iPhone17,5": "iPhone 16e",
    "iPhone18,1": "iPhone 17 Pro",
    "iPhone18,2": "iPhone 17 Pro Max",
    "iPhone18,3": "iPhone 17",
    "iPhone18,4": "iPhone Air",
    "iPhone18,5": "iPhone 17e",
    "iPhone19,2": "iPhone 18 Pro",
    "iPhone19,3": "iPhone 18 Pro Max",
    "iPhone19,4": "iPhone Duo",
    "iPhone19,7": "iPhone 18 Pro Max",

    // MARK: iPod
    "iPod1,1": "iPod Touch",
    "iPod2,1": "iPod Touch",
    "iPod3,1": "iPod Touch",
    "iPod4,1": "iPod Touch",
    "iPod5,1": "iPod Touch",
    "iPod7,1": "iPod Touch",
    "iPod9,1": "iPod Touch",

    // MARK: iPad
    "iPad1,1": "iPad",
    "iPad1,2": "iPad 3G",
    "iPad2,1": "iPad 2",
    "iPad2,2": "iPad 2",
    "iPad2,3": "iPad 2",
    "iPad2,4": "iPad 2",
    "iPad2,5": "iPad mini",
    "iPad2,6": "iPad mini",
    "iPad2,7": "iPad mini",
    "iPad3,1": "iPad (3rd generation)",
    "iPad3,2": "iPad (3rd generation)",
    "iPad3,3": "iPad (3rd generation)",
    "iPad3,4": "iPad (4th generation)",
    "iPad3,5": "iPad (4th generation)",
    "iPad3,6": "iPad (4th generation)",
    "iPad4,1": "iPad Air",
    "iPad4,2": "iPad Air",
    "iPad4,3": "iPad Air",
    "iPad4,4": "iPad mini 2",
    "iPad4,5": "iPad mini 2",
    "iPad4,6": "iPad mini 2",
    "iPad4,7": "iPad mini 3",
    "iPad4,8": "iPad mini 3",
    "iPad4,9": "iPad mini 3",
    "iPad5,1": "iPad mini 4",
    "iPad5,2": "iPad mini 4",
    "iPad5,3": "iPad Air 2",
    "iPad5,4": "iPad Air 2",
    "iPad6,3": "iPad Pro 9.7-inch",
    "iPad6,4": "iPad Pro 9.7-inch",
    "iPad6,7": "iPad Pro 12.9-inch",
    "iPad6,8": "iPad Pro 12.9-inch",
    "iPad6,11": "iPad (5th generation)",
    "iPad6,12": "iPad (5th generation)",
    "iPad7,1": "iPad Pro 12.9-inch (2nd generation)",
    "iPad7,2": "iPad Pro 12.9-inch (2nd generation)",
    "iPad7,3": "iPad Pro 10.5-inch",
    "iPad7,4": "iPad Pro 10.5-inch",
    "iPad7,5": "iPad (6th generation)",
    "iPad7,6": "iPad (6th generation)",
    "iPad7,11": "iPad (7th generation)",
    "iPad7,12": "iPad (7th generation)",
    "iPad8,1": "iPad Pro 11-inch (1st generation)",
    "iPad8,2": "iPad Pro 11-inch (1st generation)",
    "iPad8,3": "iPad Pro 11-inch (1st generation)",
    "iPad8,4": "iPad Pro 11-inch (1st generation)",
    "iPad8,5": "iPad Pro 12.9-inch (3rd generation)",
    "iPad8,6": "iPad Pro 12.9-inch (3rd generation)",
    "iPad8,7": "iPad Pro 12.9-inch (3rd generation)",
    "iPad8,8": "iPad Pro 12.9-inch (3rd generation)",
    "iPad8,9": "iPad Pro 11-inch (2nd generation)",
    "iPad8,10": "iPad Pro 11-inch (2nd generation)",
    "iPad8,11": "iPad Pro 12.9-inch (4th generation)",
    "iPad8,12": "iPad Pro 12.9-inch (4th generation)",
    "iPad11,1": "iPad mini 5",
    "iPad11,2": "iPad mini 5",
    "iPad11,3": "iPad Air (3rd generation)",
    "iPad11,4": "iPad Air (3rd generation)",
    "iPad11,6": "iPad (8th generation)",
    "iPad11,7": "iPad (8th generation)",
    "iPad12,1": "iPad (9th generation)",
    "iPad12,2": "iPad (9th generation)",
    "iPad13,1": "iPad Air (4th generation)",
    "iPad13,2": "iPad Air (4th generation)",
    "iPad13,4": "iPad Pro 11-inch (3rd generation)",
    "iPad13,5": "iPad Pro 11-inch (3rd generation)",
    "iPad13,6": "iPad Pro 11-inch (3rd generation)",
    "iPad13,7": "iPad Pro 11-inch (3rd generation)",
    "iPad13,8": "iPad Pro 12.9-inch (5th generation)",
    "iPad13,9": "iPad Pro 12.9-inch (5th generation)",
    "iPad13,10": "iPad Pro 12.9-inch (5th generation)",
    "iPad13,11": "iPad Pro 12.9-inch (5th generation)",
    "iPad13,16": "iPad Air (5th generation)",
    "iPad13,17": "iPad Air (5th generation)",
    "iPad13,18": "iPad (10th generation)",
    "iPad13,19": "iPad (10th generation)",
    "iPad14,1": "iPad mini (6th generation)",
    "iPad14,2": "iPad mini (6th generation)",
    "iPad14,3": "iPad Pro 11-inch (4th generation)",
    "iPad14,4": "iPad Pro 11-inch (4th generation)",
    "iPad14,5": "iPad Pro 12.9-inch (6th generation)",
    "iPad14,6": "iPad Pro 12.9-inch (6th generation)",
    "iPad14,8": "iPad Air 11-inch (M2)",
    "iPad14,9": "iPad Air 11-inch (M2)",
    "iPad14,10": "iPad Air 13-inch (M2)",
    "iPad14,11": "iPad Air 13-inch (M2)",
    "iPad15,3": "iPad Air 11-inch (M3)",
    "iPad15,4": "iPad Air 11-inch (M3)",
    "iPad15,5": "iPad Air 13-inch (M3)",
    "iPad15,6": "iPad Air 13-inch (M3)",
    "iPad15,7": "iPad (A16)",
    "iPad15,8": "iPad (A16)",
    "iPad16,1": "iPad mini (A17 Pro)",
    "iPad16,2": "iPad mini (A17 Pro)",
    "iPad16,3": "iPad Pro 11-inch (M4)",
    "iPad16,4": "iPad Pro 11-inch (M4)",
    "iPad16,5": "iPad Pro 13-inch (M4)",
    "iPad16,6": "iPad Pro 13-inch (M4)",
    "iPad16,8": "iPad Air 11-inch (M4)",
    "iPad16,9": "iPad Air 11-inch (M4)",
    "iPad16,10": "iPad Air 13-inch (M4)",
    "iPad16,11": "iPad Air 13-inch (M4)",
    "iPad17,1": "iPad Pro 11-inch (M5)",
    "iPad17,2": "iPad Pro 11-inch (M5)",
    "iPad17,3": "iPad Pro 13-inch (M5)",
    "iPad17,4": "iPad Pro 13-inch (M5)",

    // MARK: Apple TV
    "AppleTV2,1": "Apple TV (2nd generation)",
    "AppleTV3,1": "Apple TV (3rd generation)",
    "AppleTV3,2": "Apple TV (3rd generation)",
    "AppleTV5,3": "Apple TV (4th generation)",
    "AppleTV6,2": "Apple TV 4K",
    "AppleTV11,1": "Apple TV 4K (2nd generation)",
    "AppleTV14,1": "Apple TV 4K (3rd generation)",

    // MARK: Apple Vision
    "RealityDevice14,1": "Apple Vision Pro",
    "RealityDevice17,1": "Apple Vision Pro (M5)",
  ]

  public var systemName: String {
    return UIDevice.current.systemName
  }

  public var systemVersion: String {
    return UIDevice.current.systemVersion
  }

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

  public var uniqueId: String {
    return UIDevice.current.identifierForVendor?.uuidString ?? ""
  }

  public var manufacturer: String {
    return "Apple"
  }

  var deviceName: String {
    return UIDevice.current.name
  }

  // MARK: - Device Capabilities

  public var isTablet: Bool {
    return UIDevice.current.userInterfaceIdiom == .pad
  }

  public var isEmulator: Bool {
    #if targetEnvironment(simulator)
      return true
    #else
      return false
    #endif
  }

  var deviceYearClass: Double {
    return cachedDeviceYearClass
  }

  public var isCameraPresent: Bool {
    #if targetEnvironment(simulator)
      return false
    #else
      return AVCaptureDevice.default(for: .video) != nil
    #endif
  }

  public var isPinOrFingerprintSet: Bool {
    return LAContext().canEvaluatePolicy(.deviceOwnerAuthentication, error: nil)
  }

  var isHardwareKeyStoreAvailable: Bool {
    #if targetEnvironment(simulator)
      return false
    #else
      return SecureEnclave.isAvailable
    #endif
  }

  var isLowRamDevice: Bool {
    return false
  }

  // MARK: - Display & Screen

  /// Check if device has a display notch (mutually exclusive with Dynamic Island)
  public func getHasNotch() -> Bool {
    guard UIDevice.current.userInterfaceIdiom == .phone else {
      return false
    }

    if #available(iOS 11.0, *) {
      guard let window = keyWindow else { return false }
      return window.safeAreaInsets.top > 20 && !getHasDynamicIsland()
    }
    return false
  }

  public func getHasDynamicIsland() -> Bool {
    guard #available(iOS 16.0, *) else {
      return false
    }

    guard UIDevice.current.userInterfaceIdiom == .phone else {
      return false
    }

    guard let window = keyWindow else {
      return false
    }

    let insets = window.safeAreaInsets
    let maxInset = max(insets.top, insets.left, insets.right)
    return maxInset >= 51
  }

  var isDisplayZoomed: Bool {
    let screen = UIScreen.main
    return screen.scale < screen.nativeScale
  }

  func getIsLandscape() -> Bool {
    let orientation = UIDevice.current.orientation
    return orientation == .landscapeLeft || orientation == .landscapeRight
  }

  func getBrightness() -> Double {
    return Double(UIScreen.main.brightness)
  }

  func getFontScale() -> Double {
    let preferredFont = UIFont.preferredFont(forTextStyle: .body)
    let defaultSize: CGFloat = 17.0
    return Double(preferredFont.pointSize / defaultSize)
  }

  var isLiquidGlassAvailable: Bool {
    #if compiler(>=6.2)
    if #available(iOS 26.0, *) {
      if let infoPlist = Bundle.main.infoDictionary,
         let requiresCompatibility = infoPlist["UIDesignRequiresCompatibility"] as? Bool {
        return !requiresCompatibility
      }
      return true
    }
    #endif
    return false
  }

  // MARK: - System Resources

  public var totalMemory: Double {
    return Double(ProcessInfo.processInfo.physicalMemory)
  }

  public func getUsedMemory() -> Double {
    return physFootprint() ?? 0.0
  }

  /// The app's jetsam limit: current footprint plus the headroom left before termination.
  /// `os_proc_available_memory()` returns 0 when no limit applies (e.g. the Simulator) or the app exceeds its limit.
  var maxMemory: Double {
    let available = os_proc_available_memory()
    guard available > 0, let footprint = physFootprint() else { return -1 }
    return footprint + Double(available)
  }

  /// `phys_footprint` is the value jetsam and Xcode's memory gauge use; `resident_size` excludes compressed memory.
  private func physFootprint() -> Double? {
    var info = task_vm_info_data_t()
    var count = mach_msg_type_number_t(MemoryLayout<task_vm_info_data_t>.size / MemoryLayout<integer_t>.size)

    let kerr: kern_return_t = withUnsafeMutablePointer(to: &info) {
      $0.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
        task_info(mach_task_self_, task_flavor_t(TASK_VM_INFO), $0, &count)
      }
    }

    return kerr == KERN_SUCCESS ? Double(info.phys_footprint) : nil
  }

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

  /// iOS supports this clock only for app-event timing (35F9.1 / 8FFB.1).
  func getUptime() -> Double {
    return ProcessInfo.processInfo.systemUptime * 1000
  }

  /// iOS supports this time base only for absolute app-event timestamps (8FFB.1).
  var startupTime: Double {
    let uptime = ProcessInfo.processInfo.systemUptime
    let bootTime = Date().timeIntervalSince1970 - uptime
    return bootTime * 1000
  }

  // MARK: - Battery & Power

  public func getBatteryLevel() -> Double {
    _ = batteryMonitoringInitializer
    let level = UIDevice.current.batteryLevel
    return level >= 0 && level <= 1 ? Double(level) : -1
  }

  public func getPowerState() -> PowerState {
    _ = batteryMonitoringInitializer

    let batteryLevel = getBatteryLevel()
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

  public func getIsBatteryCharging() -> Bool {
    _ = batteryMonitoringInitializer
    return UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full
  }

  func isLowBatteryLevel(threshold: Double) -> Bool {
    let level = getBatteryLevel()
    return level >= 0 && level <= 1 && level < threshold
  }

  // MARK: - Application Metadata

  public var version: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleShortVersionString") as? String ?? ""
  }

  public var buildNumber: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? ""
  }

  public var bundleId: String {
    return Bundle.main.bundleIdentifier ?? ""
  }

  public var applicationName: String {
    return Bundle.main.object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ??
           Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? ""
  }

  var readableVersion: String {
    return "\(version).\(buildNumber)"
  }

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

  var firstInstallTimeSync: Double {
    return cachedFirstInstallTime
  }

  var lastUpdateTimeSync: Double {
    return -1
  }

  // MARK: - Network

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

          let name = String(cString: interface.ifa_name)
          guard name == "en0" || name == "pdp_ip0" else { continue }

          guard let addr = interface.ifa_addr else { continue }
          let addrFamily = addr.pointee.sa_family

          var hostname = [CChar](repeating: 0, count: Int(NI_MAXHOST))
          if getnameinfo(addr, socklen_t(addr.pointee.sa_len),
                        &hostname, socklen_t(hostname.count),
                        nil, socklen_t(0), NI_NUMERICHOST) == 0 {
            let address = String(cString: hostname)

            if addrFamily == UInt8(AF_INET) {
              ipv4Address = address
            } else if addrFamily == UInt8(AF_INET6) && ipv6Address == nil {
              ipv6Address = address
            }
          }
        }
        freeifaddrs(ifaddr)
      }

      return ipv4Address ?? ipv6Address ?? "unknown"
    }
  }

  func getIpAddressSync() -> String {
    let now = Date().timeIntervalSince1970
    if now - ipAddressCacheTime > IP_CACHE_DURATION {
      cachedIpAddress = queryIpAddressInternal()
      ipAddressCacheTime = now
    }
    return cachedIpAddress
  }

  /// Get MAC address (hardcoded on iOS 7+ due to privacy restrictions)
  public func getMacAddress() throws -> Promise<String> {
    // Immediate value: resolved avoids the Promise.async Task-schedule delay
    // that can race a pending C++ Promise to destruction.
    return Promise.resolved(withResult: getMacAddressSync())
  }

  /// Get MAC address (hardcoded on iOS 7+ due to privacy restrictions)
  func getMacAddressSync() -> String {
    return "02:00:00:00:00:00"
  }

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

  func getIsAirplaneMode() -> Bool {
    return false
  }

  // MARK: - Carrier Information

  public func getCarrier() throws -> Promise<String> {
    // Delegate to the sync query (5s cache) so async matches sync and Android's
    // real carrier name; resolved avoids the Promise.async Task-schedule delay
    // that can race a pending C++ Promise to destruction.
    return Promise.resolved(withResult: getCarrierSync())
  }

  func getCarrierSync() -> String {
    let now = Date().timeIntervalSince1970
    if now - carrierCacheTime > CARRIER_CACHE_DURATION {
      let networkInfo = CTTelephonyNetworkInfo()
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

  var carrierAllowsVOIP: Bool {
    return cachedCarrierObject?.allowsVOIP ?? true
  }

  var carrierIsoCountryCode: String {
    return cachedCarrierObject?.isoCountryCode ?? ""
  }

  var mobileCountryCode: String {
    return cachedCarrierObject?.mobileCountryCode ?? ""
  }

  var mobileNetworkCode: String {
    return cachedCarrierObject?.mobileNetworkCode ?? ""
  }

  var mobileNetworkOperator: String {
    let mcc = mobileCountryCode
    let mnc = mobileNetworkCode
    if mcc.isEmpty && mnc.isEmpty {
      return ""
    }
    return mcc + mnc
  }

  // MARK: - Audio Accessories

  public func isHeadphonesConnected() throws -> Promise<Bool> {
    // Delegate to the sync AVAudioSession query so async matches sync (was
    // hardcoded false); resolved avoids the Promise.async Task-schedule delay
    // that can race a pending C++ Promise to destruction.
    return Promise.resolved(withResult: getIsHeadphonesConnected())
  }

  func getIsHeadphonesConnected() -> Bool {
    return getIsWiredHeadphonesConnected() || getIsBluetoothHeadphonesConnected()
  }

  func getIsWiredHeadphonesConnected() -> Bool {
    let route = AVAudioSession.sharedInstance().currentRoute
    return route.outputs.contains { output in
      output.portType == .headphones
    }
  }

  func getIsBluetoothHeadphonesConnected() -> Bool {
    let route = AVAudioSession.sharedInstance().currentRoute
    return route.outputs.contains { output in
      output.portType == .bluetoothA2DP ||
      output.portType == .bluetoothHFP ||
      output.portType == .bluetoothLE
    }
  }

  // MARK: - Location Services

  public func isLocationEnabled() throws -> Promise<Bool> {
    // Stays on Promise.async (not resolved): CLLocationManager
    // .locationServicesEnabled() can block and warns when called on the main
    // thread, so it runs in the Task rather than synchronously on the caller.
    // The sync logic is reused (was hardcoded false) so async matches sync.
    return Promise.async { [weak self] in
      self?.getIsLocationEnabled() ?? false
    }
  }

  func getIsLocationEnabled() -> Bool {
    return CLLocationManager.locationServicesEnabled()
  }

  func getAvailableLocationProviders() -> [String] {
    let enabled = CLLocationManager.locationServicesEnabled()
    if enabled {
      return ["gps", "network"]
    } else {
      return []
    }
  }

  // MARK: - Localization

  var systemLanguage: String {
    return Locale.preferredLanguages.first ?? "en"
  }

  // MARK: - CPU & Architecture

  public var supportedAbis: [String] {
    #if arch(arm64)
      return ["arm64"]
    #elseif arch(x86_64)
      return ["x86_64"]
    #else
      return ["unknown"]
    #endif
  }

  /// Get supported 32-bit ABIs (iOS devices are 64-bit only since iPhone 5s)
  var supported32BitAbis: [String] {
    return []
  }

  var supported64BitAbis: [String] {
    var arch: String = "arm64"

    #if targetEnvironment(simulator)
      #if arch(x86_64)
        arch = "x86_64"
      #elseif arch(arm64)
        arch = "arm64"
      #endif
    #endif

    return [arch]
  }

  // MARK: - Android Platform (Cross-Platform Defaults for iOS)

  public var apiLevel: Double {
    return -1.0
  }

  var navigationMode: NavigationMode {
    return .unknown
  }

  public func getHasGms() -> Bool {
    return false
  }

  public func getHasHms() -> Bool {
    return false
  }

  func hasSystemFeature(feature: String) -> Bool {
    return false
  }

  var systemAvailableFeatures: [String] {
    return []
  }

  var supportedMediaTypeList: [String] {
    return []
  }

  // Android Build Information

  var serialNumber: String { "unknown" }

  var androidId: String { "unknown" }

  var previewSdkInt: Double { 0.0 }

  var securityPatch: String { "unknown" }

  var codename: String { "unknown" }

  var incremental: String { "unknown" }

  var board: String { "unknown" }

  var bootloader: String { "unknown" }

  var device: String { "unknown" }

  var display: String { "unknown" }

  var fingerprint: String { "unknown" }

  var hardware: String { "unknown" }

  var host: String { "unknown" }

  var product: String { "unknown" }

  var tags: String { "unknown" }

  var type: String { "unknown" }

  var baseOs: String { "" }

  var radioVersion: String { "unknown" }

  var buildId: String { "unknown" }

  // MARK: - iOS Platform

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

  // MARK: - Installation & Distribution

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

  func getInstallReferrer() throws -> Promise<String> {
    return Promise.async {
      return "unknown"
    }
  }

  func isSideLoadingEnabled() -> Bool {
    return false
  }

  // MARK: - Legacy Compatibility

  var totalDiskCapacityOld: Double {
    return totalDiskCapacity
  }

  func getFreeDiskStorageOld() -> Double {
    return getFreeDiskStorage()
  }

  // MARK: - Device Integrity / Security

  func isDeviceCompromised() -> Bool {
    #if targetEnvironment(simulator)
      return false
    #else
      return checkJailbreakFiles() ||
             checkJailbreakUrlSchemes() ||
             checkSystemFileWritable() ||
             checkSuspiciousDylibs() ||
             checkSymbolicLinks()
    #endif
  }

  func verifyDeviceIntegrity() throws -> Promise<Bool> {
    return Promise.async {
      #if targetEnvironment(simulator)
        return false
      #else
        return self.checkJailbreakFiles() ||
               self.checkJailbreakUrlSchemes() ||
               self.checkSystemFileWritable() ||
               self.checkSuspiciousDylibs() ||
               self.checkSymbolicLinks() ||
               self.checkSshPorts()
      #endif
    }
  }

  // MARK: - Windows Platform (Unsupported)

  var isMouseConnected: Bool {
    return false
  }

  var isKeyboardConnected: Bool {
    return false
  }

  var hostNames: [String] {
    return []
  }

  var isTabletMode: Bool {
    return false
  }

  // MARK: - Helper Methods

  private func getDeviceModelIdentifier() -> String {
    // resolve deviceId on simulators correctly, i.e iPhone17,1 instead of arm64 or any other architecture
    if(isEmulator){
      return ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] ?? "unknown"
    }
    var systemInfo = utsname()
    uname(&systemInfo)
    let machineMirror = Mirror(reflecting: systemInfo.machine)
    let identifier = machineMirror.children.reduce("") { identifier, element in
      guard let value = element.value as? Int8, value != 0 else { return identifier }
      return identifier + String(UnicodeScalar(UInt8(value)))
    }
    return identifier
  }

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

  private func queryIpAddressInternal() -> String {
    var ipv4Address: String?
    var ipv6Address: String?
    var ifaddr: UnsafeMutablePointer<ifaddrs>?

    guard getifaddrs(&ifaddr) == 0 else { return "unknown" }
    guard let firstAddr = ifaddr else { return "unknown" }

    defer { freeifaddrs(ifaddr) }

    for ptr in sequence(first: firstAddr, next: { $0.pointee.ifa_next }) {
      let interface = ptr.pointee

      let name = String(cString: interface.ifa_name)
      guard name == "en0" || name == "pdp_ip0" else { continue }

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

        if addrFamily == UInt8(AF_INET) {
          ipv4Address = address
        } else if addrFamily == UInt8(AF_INET6) && ipv6Address == nil {
          ipv6Address = address
        }
      }
    }

    return ipv4Address ?? ipv6Address ?? "unknown"
  }

  // MARK: - Jailbreak Detection Helpers

  private func checkJailbreakFiles() -> Bool {
    let jailbreakPaths = [
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

  private func checkJailbreakUrlSchemes() -> Bool {
    let jailbreakSchemes = [
      "cydia://",
      "sileo://",
      "zbra://",
      "filza://",
      "activator://"
    ]

    for scheme in jailbreakSchemes {
      if let url = URL(string: scheme), UIApplication.shared.canOpenURL(url) {
        return true
      }
    }
    return false
  }

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
        try? fileManager.removeItem(atPath: path)
        return true
      } catch {
        // Write failure is normal (not jailbroken)
      }
    }
    return false
  }

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

  /// Checks for symbolic links (created during jailbreak)
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

  /// Checks SSH ports (OpenSSH installed during jailbreak)
  private func checkSshPorts() -> Bool {
    let sshPorts = [22, 44]

    for port in sshPorts {
      if canConnectToPort(port: port) {
        return true
      }
    }
    return false
  }

  private func canConnectToPort(port: Int) -> Bool {
    var addr = sockaddr_in()
    addr.sin_family = sa_family_t(AF_INET)
    addr.sin_port = in_port_t(port).bigEndian
    addr.sin_addr.s_addr = inet_addr("127.0.0.1")

    let sock = socket(AF_INET, SOCK_STREAM, 0)
    guard sock != -1 else { return false }
    defer { close(sock) }

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

    if errno == EINPROGRESS {
      var pollFd = pollfd(fd: sock, events: Int16(POLLOUT), revents: 0)
      let pollResult = poll(&pollFd, 1, 100)
      return pollResult > 0 && (pollFd.revents & Int16(POLLOUT)) != 0
    }

    return false
  }
}
