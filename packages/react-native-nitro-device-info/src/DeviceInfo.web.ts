/**
 * Web fallback implementation of the `DeviceInfo` HybridObject.
 *
 * Nitro's native bindings do not exist in a browser / SSR runtime, so importing
 * the native `DeviceInfoModule` there throws at load time (the upstream
 * `react-native-nitro-modules` web stub is a Proxy that throws on any access).
 * This module provides a pure-JS object that satisfies the full `DeviceInfo`
 * interface so that `react-native-web`, Next.js SSR, and plain webpack builds can
 * import the package without crashing.
 *
 * Value policy:
 * - Where a browser API can supply a real answer (user agent, language, screen
 *   orientation, battery, memory hint) we read it, guarded for SSR.
 * - Otherwise we return the same honest constants the native side uses for an
 *   unsupported platform ("unknown" / -1 / false / [] / 0). We deliberately do
 *   NOT fabricate plausible-looking device values.
 *
 * @module react-native-nitro-device-info/DeviceInfo.web
 */

import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from './DeviceInfo.nitro';

/**
 * Minimal structural shapes for the browser globals we read. The library's
 * tsconfig intentionally excludes the DOM lib (it targets React Native), so we
 * declare only the few fields we touch here rather than pulling in `lib.dom`.
 * Every access is still guarded for SSR, so these types describe the shape we
 * expect *if* the global exists — never an assumption that it does.
 */
interface WebNavigator {
  readonly userAgent?: string;
  readonly language?: string;
  readonly vendor?: string;
  readonly onLine?: boolean;
  readonly deviceMemory?: number;
  readonly getBattery?: () => Promise<BatteryManagerLike>;
}

interface WebScreen {
  readonly width: number;
  readonly height: number;
}

declare const navigator: WebNavigator | undefined;
declare const screen: WebScreen | undefined;

/**
 * Read a browser global only when it actually exists. Returns `undefined` on the
 * server (Node/SSR) where `navigator`/`screen`/`window` are not defined, so no
 * access ever throws at import time or during a getter call.
 */
function safeNavigator(): WebNavigator | undefined {
  return typeof navigator !== 'undefined' ? navigator : undefined;
}

function safeScreen(): WebScreen | undefined {
  return typeof screen !== 'undefined' ? screen : undefined;
}

/**
 * Minimal shape of the Battery Status API result we consume. The API is
 * deprecated and absent in most browsers, so it is always accessed defensively.
 */
interface BatteryManagerLike {
  level: number;
  charging: boolean;
}

/**
 * Cached battery snapshot. `navigator.getBattery()` is async, deprecated, and
 * missing on most browsers, so we kick off a single guarded read at module load
 * and consume whatever resolved value is available from the synchronous getters.
 * It never rejects outward: failure leaves the cache `null` and getters fall back.
 */
let batteryCache: BatteryManagerLike | null = null;

function primeBatteryCache(): void {
  const nav = safeNavigator();
  // `getBattery` is non-standard; guard the function's existence before calling.
  const getBattery = nav?.getBattery;
  if (typeof getBattery !== 'function' || nav === undefined) {
    return;
  }
  try {
    getBattery
      .call(nav)
      .then((battery) => {
        batteryCache = { level: battery.level, charging: battery.charging };
      })
      .catch(() => {
        // Permission-gated or unsupported: keep the fallback, never reject.
      });
  } catch {
    // Synchronous throw (some engines): keep the fallback.
  }
}

primeBatteryCache();

/**
 * Map the cached browser battery snapshot to the native `BatteryState` enum.
 * Without a real reading we report "unknown" rather than guessing.
 */
function currentBatteryState(): BatteryState {
  if (batteryCache === null) {
    return 'unknown';
  }
  if (batteryCache.charging) {
    return batteryCache.level >= 1 ? 'full' : 'charging';
  }
  return 'unplugged';
}

/**
 * Derive an OS name from the user agent. Best-effort only; falls back to "web".
 */
function deriveSystemName(): string {
  const ua = safeNavigator()?.userAgent;
  if (ua === undefined) {
    return 'web';
  }
  if (/android/i.test(ua)) return 'Android';
  if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
  if (/windows/i.test(ua)) return 'Windows';
  if (/mac os x|macintosh/i.test(ua)) return 'macOS';
  if (/linux/i.test(ua)) return 'Linux';
  return 'web';
}

/**
 * Total physical memory hint from `navigator.deviceMemory` (GiB, coarsely
 * bucketed by the spec), converted to bytes. Returns -1 when unavailable.
 */
function deriveTotalMemory(): number {
  const deviceMemory = safeNavigator()?.deviceMemory;
  return typeof deviceMemory === 'number' ? deviceMemory * 1024 * 1024 * 1024 : -1;
}

/**
 * Web fallback singleton. The explicit `: DeviceInfo` annotation forces this
 * object to implement every interface member at compile time — a missing or
 * mistyped member is a `tsc` error, which is the exhaustiveness guarantee.
 */
const webDeviceInfo: DeviceInfo = {
  // ---- HybridObject base members ----
  name: 'DeviceInfo',
  toString: () => '[HybridObject DeviceInfo]',
  equals: (other) => other === webDeviceInfo,
  dispose: () => {
    // No native resources to release on web.
  },

  // ---- Core device information ----
  deviceId: 'unknown',
  brand: safeNavigator()?.vendor || 'unknown',
  model: 'unknown',
  get systemName(): string {
    return deriveSystemName();
  },
  systemVersion: 'unknown',
  deviceType: 'unknown' as DeviceType,
  uniqueId: 'unknown',
  manufacturer: safeNavigator()?.vendor || 'unknown',
  deviceName: 'unknown',

  // ---- Device capabilities ----
  isTablet: false,
  isEmulator: false,
  deviceYearClass: -1,
  isCameraPresent: false,
  isPinOrFingerprintSet: false,
  isHardwareKeyStoreAvailable: false,
  isLowRamDevice: false,

  // ---- Display & screen ----
  getHasNotch: () => false,
  getHasDynamicIsland: () => false,
  isDisplayZoomed: false,
  getIsLandscape: () => {
    const s = safeScreen();
    return s !== undefined ? s.width > s.height : false;
  },
  getBrightness: () => -1,
  getFontScale: () => 1,
  isLiquidGlassAvailable: false,

  // ---- System resources ----
  get totalMemory(): number {
    return deriveTotalMemory();
  },
  getUsedMemory: () => -1,
  maxMemory: -1,
  totalDiskCapacity: -1,
  getFreeDiskStorage: () => -1,
  getUptime: () => -1,
  startupTime: -1,

  // ---- Battery & power ----
  getBatteryLevel: () => (batteryCache !== null ? batteryCache.level : -1),
  getPowerState: (): PowerState => ({
    batteryLevel: batteryCache !== null ? batteryCache.level : -1,
    batteryState: currentBatteryState(),
    lowPowerMode: false,
  }),
  getIsBatteryCharging: () =>
    batteryCache !== null ? batteryCache.charging : false,
  isLowBatteryLevel: (threshold) => {
    const level = batteryCache !== null ? batteryCache.level : -1;
    return level >= 0 && level < threshold;
  },

  // ---- Application metadata ----
  version: 'unknown',
  buildNumber: 'unknown',
  bundleId: 'unknown',
  applicationName: 'unknown',
  readableVersion: 'unknown',
  getFirstInstallTime: () => Promise.resolve(-1),
  getLastUpdateTime: () => Promise.resolve(-1),
  firstInstallTimeSync: -1,
  lastUpdateTimeSync: -1,

  // ---- Network ----
  getIpAddress: () => Promise.resolve('unknown'),
  getIpAddressSync: () => 'unknown',
  getMacAddress: () => Promise.resolve('02:00:00:00:00:00'),
  getMacAddressSync: () => '02:00:00:00:00:00',
  getUserAgent: () => Promise.resolve(safeNavigator()?.userAgent ?? 'unknown'),
  getIsAirplaneMode: () => {
    const nav = safeNavigator();
    // `onLine` only tells us connectivity, not airplane mode; report the
    // honest default and never throw.
    return nav !== undefined ? nav.onLine === false : false;
  },

  // ---- Carrier information ----
  getCarrier: () => Promise.resolve('unknown'),
  getCarrierSync: () => 'unknown',
  carrierAllowsVOIP: false,
  carrierIsoCountryCode: 'unknown',
  mobileCountryCode: 'unknown',
  mobileNetworkCode: 'unknown',
  mobileNetworkOperator: 'unknown',

  // ---- Audio accessories ----
  isHeadphonesConnected: () => Promise.resolve(false),
  getIsHeadphonesConnected: () => false,
  getIsWiredHeadphonesConnected: () => false,
  getIsBluetoothHeadphonesConnected: () => false,

  // ---- Location services ----
  isLocationEnabled: () => Promise.resolve(false),
  getIsLocationEnabled: () => false,
  getAvailableLocationProviders: () => [],

  // ---- Localization ----
  systemLanguage: safeNavigator()?.language || 'unknown',

  // ---- CPU & architecture ----
  supportedAbis: [],
  supported32BitAbis: [],
  supported64BitAbis: [],

  // ---- Android platform ----
  apiLevel: -1,
  navigationMode: 'unknown',
  getHasGms: () => false,
  getHasHms: () => false,
  hasSystemFeature: () => false,
  systemAvailableFeatures: [],
  supportedMediaTypeList: [],
  serialNumber: 'unknown',
  androidId: 'unknown',
  previewSdkInt: 0,
  securityPatch: 'unknown',
  codename: 'unknown',
  incremental: 'unknown',
  board: 'unknown',
  bootloader: 'unknown',
  device: 'unknown',
  display: 'unknown',
  fingerprint: 'unknown',
  hardware: 'unknown',
  host: 'unknown',
  product: 'unknown',
  tags: 'unknown',
  type: 'unknown',
  baseOs: '',
  radioVersion: 'unknown',
  buildId: 'unknown',

  // ---- iOS platform ----
  getDeviceToken: () =>
    Promise.reject(new Error('getDeviceToken is not available on web')),
  syncUniqueId: () => Promise.resolve('unknown'),

  // ---- Installation & distribution ----
  installerPackageName: 'unknown',
  getInstallReferrer: () => Promise.resolve('unknown'),
  isSideLoadingEnabled: () => false,

  // ---- Legacy compatibility ----
  totalDiskCapacityOld: -1,
  getFreeDiskStorageOld: () => -1,

  // ---- Device integrity / security ----
  isDeviceCompromised: () => false,
  verifyDeviceIntegrity: () => Promise.resolve(false),

  // ---- Windows platform (unsupported) ----
  isMouseConnected: false,
  isKeyboardConnected: false,
  hostNames: [],
  isTabletMode: false,
};

/**
 * Web variant of {@link createDeviceInfo}. Returns the shared web fallback
 * singleton; there is no per-instance native state to allocate.
 */
export function createDeviceInfo(): DeviceInfo {
  return webDeviceInfo;
}

export { webDeviceInfo };
