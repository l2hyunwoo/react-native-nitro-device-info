/**
 * `react-native-device-info` (RNDI) drop-in compatibility layer.
 *
 * Exposes the public surface of `react-native-device-info@15.x` backed by this
 * package's native `DeviceInfoModule`, so an RNDI codebase compiles and runs
 * after only its import specifier is changed to
 * `react-native-nitro-device-info/compat`.
 *
 * Three usage shapes are supported simultaneously:
 * 1. Named function exports — `import { getModel } from '.../compat'`
 * 2. Default object        — `import DeviceInfo from '.../compat'`
 * 3. Named hook exports     — `import { useBatteryLevel } from '.../compat'`
 *
 * @module react-native-nitro-device-info/compat
 */

import { useEffect, useState } from 'react';
import { DeviceInfoModule } from '../index';
import {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useBrightness,
  useIsHeadphonesConnected as useIsHeadphonesConnectedCore,
  useIsWiredHeadphonesConnected as useIsWiredHeadphonesConnectedCore,
  useIsBluetoothHeadphonesConnected as useIsBluetoothHeadphonesConnectedCore,
} from '../hooks';
import {
  asyncProp,
  syncProp,
  providersArrayToMap,
  toAsyncHookResult,
} from './transforms';
import type {
  AsyncHookResult,
  AppSetIdInfo,
  AvailableCapacityType,
  LocationProviderInfo,
  PowerState,
} from './transforms';

// ============================================================================
// 1. Device identity & model
// ============================================================================

export const getUniqueId = asyncProp(() => DeviceInfoModule.uniqueId);
export const getUniqueIdSync = syncProp(() => DeviceInfoModule.uniqueId);
export const syncUniqueId = (): Promise<string> =>
  DeviceInfoModule.syncUniqueId();

export const getDeviceId = (): string => DeviceInfoModule.deviceId;
export const getModel = (): string => DeviceInfoModule.model;
export const getBrand = (): string => DeviceInfoModule.brand;

export const getManufacturer = asyncProp(() => DeviceInfoModule.manufacturer);
export const getManufacturerSync = syncProp(
  () => DeviceInfoModule.manufacturer
);

export const getDeviceName = asyncProp(() => DeviceInfoModule.deviceName);
export const getDeviceNameSync = syncProp(() => DeviceInfoModule.deviceName);

export const getDeviceType = (): string => DeviceInfoModule.deviceType;
export const getDeviceTypeSync = (): string => DeviceInfoModule.deviceType;

export const getSerialNumber = asyncProp(() => DeviceInfoModule.serialNumber);
export const getSerialNumberSync = syncProp(
  () => DeviceInfoModule.serialNumber
);

export const getAndroidId = asyncProp(() => DeviceInfoModule.androidId);
export const getAndroidIdSync = syncProp(() => DeviceInfoModule.androidId);

export const getMacAddress = (): Promise<string> =>
  DeviceInfoModule.getMacAddress();
export const getMacAddressSync = (): string =>
  DeviceInfoModule.getMacAddressSync();

/**
 * @remarks
 * Stub: this package has no Firebase Instance ID equivalent. Returns `'unknown'`,
 * matching RNDI's value when the deprecated Firebase IID path is unavailable.
 */
export const getInstanceId = asyncProp((): string => 'unknown');

/**
 * @remarks
 * Stub: see {@link getInstanceId}. Returns `'unknown'`.
 */
export const getInstanceIdSync = syncProp((): string => 'unknown');

/**
 * @remarks
 * Stub: this package has no Google Play Services App Set ID equivalent. Returns
 * `{ id: 'unknown', scope: -1 }`, identical to RNDI's value when the optional
 * Play Services App Set dependency is absent.
 */
export const getAppSetId = (): Promise<AppSetIdInfo> =>
  Promise.resolve({ id: 'unknown', scope: -1 });

// ============================================================================
// 2. OS / system
// ============================================================================

export const getSystemName = (): string => DeviceInfoModule.systemName;
export const getSystemVersion = (): string => DeviceInfoModule.systemVersion;

export const getApiLevel = asyncProp(() => DeviceInfoModule.apiLevel);
export const getApiLevelSync = syncProp(() => DeviceInfoModule.apiLevel);

export const getBuildId = asyncProp(() => DeviceInfoModule.buildId);
export const getBuildIdSync = syncProp(() => DeviceInfoModule.buildId);

export const getBaseOs = asyncProp(() => DeviceInfoModule.baseOs);
export const getBaseOsSync = syncProp(() => DeviceInfoModule.baseOs);

export const getBootloader = asyncProp(() => DeviceInfoModule.bootloader);
export const getBootloaderSync = syncProp(() => DeviceInfoModule.bootloader);

export const getCodename = asyncProp(() => DeviceInfoModule.codename);
export const getCodenameSync = syncProp(() => DeviceInfoModule.codename);

export const getDevice = asyncProp(() => DeviceInfoModule.device);
export const getDeviceSync = syncProp(() => DeviceInfoModule.device);

export const getDisplay = asyncProp(() => DeviceInfoModule.display);
export const getDisplaySync = syncProp(() => DeviceInfoModule.display);

export const getFingerprint = asyncProp(() => DeviceInfoModule.fingerprint);
export const getFingerprintSync = syncProp(() => DeviceInfoModule.fingerprint);

export const getHardware = asyncProp(() => DeviceInfoModule.hardware);
export const getHardwareSync = syncProp(() => DeviceInfoModule.hardware);

export const getHost = asyncProp(() => DeviceInfoModule.host);
export const getHostSync = syncProp(() => DeviceInfoModule.host);

export const getProduct = asyncProp(() => DeviceInfoModule.product);
export const getProductSync = syncProp(() => DeviceInfoModule.product);

export const getTags = asyncProp(() => DeviceInfoModule.tags);
export const getTagsSync = syncProp(() => DeviceInfoModule.tags);

export const getType = asyncProp(() => DeviceInfoModule.type);
export const getTypeSync = syncProp(() => DeviceInfoModule.type);

export const getIncremental = asyncProp(() => DeviceInfoModule.incremental);
export const getIncrementalSync = syncProp(() => DeviceInfoModule.incremental);

export const getSecurityPatch = asyncProp(() => DeviceInfoModule.securityPatch);
export const getSecurityPatchSync = syncProp(
  () => DeviceInfoModule.securityPatch
);

export const getPreviewSdkInt = asyncProp(() => DeviceInfoModule.previewSdkInt);
export const getPreviewSdkIntSync = syncProp(
  () => DeviceInfoModule.previewSdkInt
);

export const getHostNames = asyncProp(() => DeviceInfoModule.hostNames);
export const getHostNamesSync = syncProp(() => DeviceInfoModule.hostNames);

// ============================================================================
// 3. App metadata
// ============================================================================

export const getVersion = (): string => DeviceInfoModule.version;
export const getBuildNumber = (): string => DeviceInfoModule.buildNumber;
export const getBundleId = (): string => DeviceInfoModule.bundleId;
export const getApplicationName = (): string =>
  DeviceInfoModule.applicationName;
export const getReadableVersion = (): string =>
  DeviceInfoModule.readableVersion;

export const getInstallerPackageName = asyncProp(
  () => DeviceInfoModule.installerPackageName
);
export const getInstallerPackageNameSync = syncProp(
  () => DeviceInfoModule.installerPackageName
);

export const getInstallReferrer = (): Promise<string> =>
  DeviceInfoModule.getInstallReferrer();

/**
 * @remarks
 * The install referrer is only available asynchronously on this package (Play
 * Services API). The sync variant returns `'unknown'`; use {@link getInstallReferrer}
 * for the real value.
 */
export const getInstallReferrerSync = syncProp((): string => 'unknown');

export const getFirstInstallTime = (): Promise<number> =>
  DeviceInfoModule.getFirstInstallTime();
export const getFirstInstallTimeSync = syncProp(
  () => DeviceInfoModule.firstInstallTimeSync
);

export const getLastUpdateTime = (): Promise<number> =>
  DeviceInfoModule.getLastUpdateTime();
export const getLastUpdateTimeSync = syncProp(
  () => DeviceInfoModule.lastUpdateTimeSync
);

export const getStartupTime = asyncProp(() => DeviceInfoModule.startupTime);
export const getStartupTimeSync = syncProp(() => DeviceInfoModule.startupTime);

// ============================================================================
// 4. Capabilities & flags
// ============================================================================

export const isEmulator = asyncProp(() => DeviceInfoModule.isEmulator);
export const isEmulatorSync = syncProp(() => DeviceInfoModule.isEmulator);

export const isTablet = (): boolean => DeviceInfoModule.isTablet;
export const isLowRamDevice = (): boolean => DeviceInfoModule.isLowRamDevice;
export const isDisplayZoomed = (): boolean => DeviceInfoModule.isDisplayZoomed;

export const isPinOrFingerprintSet = asyncProp(
  () => DeviceInfoModule.isPinOrFingerprintSet
);
export const isPinOrFingerprintSetSync = syncProp(
  () => DeviceInfoModule.isPinOrFingerprintSet
);

export const isCameraPresent = asyncProp(
  () => DeviceInfoModule.isCameraPresent
);
export const isCameraPresentSync = syncProp(
  () => DeviceInfoModule.isCameraPresent
);

export const hasNotch = (): boolean => DeviceInfoModule.getHasNotch();
export const hasDynamicIsland = (): boolean =>
  DeviceInfoModule.getHasDynamicIsland();

export const hasGms = asyncProp(() => DeviceInfoModule.getHasGms());
export const hasGmsSync = syncProp(() => DeviceInfoModule.getHasGms());

export const hasHms = asyncProp(() => DeviceInfoModule.getHasHms());
export const hasHmsSync = syncProp(() => DeviceInfoModule.getHasHms());

export const hasSystemFeature = (feature: string): Promise<boolean> =>
  Promise.resolve(DeviceInfoModule.hasSystemFeature(feature));
export const hasSystemFeatureSync = (feature: string): boolean =>
  DeviceInfoModule.hasSystemFeature(feature);

export const getSystemAvailableFeatures = asyncProp(
  () => DeviceInfoModule.systemAvailableFeatures
);
export const getSystemAvailableFeaturesSync = syncProp(
  () => DeviceInfoModule.systemAvailableFeatures
);

export const getSupportedMediaTypeList = asyncProp(
  () => DeviceInfoModule.supportedMediaTypeList
);
export const getSupportedMediaTypeListSync = syncProp(
  () => DeviceInfoModule.supportedMediaTypeList
);

export const isLandscape = asyncProp(() => DeviceInfoModule.getIsLandscape());
export const isLandscapeSync = syncProp(() =>
  DeviceInfoModule.getIsLandscape()
);

export const isTabletMode = asyncProp(() => DeviceInfoModule.isTabletMode);

export const isMouseConnected = asyncProp(
  () => DeviceInfoModule.isMouseConnected
);
export const isMouseConnectedSync = syncProp(
  () => DeviceInfoModule.isMouseConnected
);

export const isKeyboardConnected = asyncProp(
  () => DeviceInfoModule.isKeyboardConnected
);
export const isKeyboardConnectedSync = syncProp(
  () => DeviceInfoModule.isKeyboardConnected
);

// ============================================================================
// 5. CPU / ABIs
// ============================================================================

export const supportedAbis = asyncProp(() => DeviceInfoModule.supportedAbis);
export const supportedAbisSync = syncProp(
  () => DeviceInfoModule.supportedAbis
);

export const supported32BitAbis = asyncProp(
  () => DeviceInfoModule.supported32BitAbis
);
export const supported32BitAbisSync = syncProp(
  () => DeviceInfoModule.supported32BitAbis
);

export const supported64BitAbis = asyncProp(
  () => DeviceInfoModule.supported64BitAbis
);
export const supported64BitAbisSync = syncProp(
  () => DeviceInfoModule.supported64BitAbis
);

// ============================================================================
// 6. Memory & storage
// ============================================================================

export const getTotalMemory = asyncProp(() => DeviceInfoModule.totalMemory);
export const getTotalMemorySync = syncProp(() => DeviceInfoModule.totalMemory);

export const getUsedMemory = asyncProp(() => DeviceInfoModule.getUsedMemory());
export const getUsedMemorySync = syncProp(() =>
  DeviceInfoModule.getUsedMemory()
);

export const getMaxMemory = asyncProp(() => DeviceInfoModule.maxMemory);
export const getMaxMemorySync = syncProp(() => DeviceInfoModule.maxMemory);

export const getTotalDiskCapacity = asyncProp(
  () => DeviceInfoModule.totalDiskCapacity
);
export const getTotalDiskCapacitySync = syncProp(
  () => DeviceInfoModule.totalDiskCapacity
);

export const getTotalDiskCapacityOld = asyncProp(
  () => DeviceInfoModule.totalDiskCapacityOld
);
export const getTotalDiskCapacityOldSync = syncProp(
  () => DeviceInfoModule.totalDiskCapacityOld
);

/**
 * @remarks
 * The `storageType` argument is accepted for RNDI signature parity but ignored;
 * this package has no per-bucket (iOS) storage query.
 */
export const getFreeDiskStorage = (
  _storageType?: AvailableCapacityType
): Promise<number> => Promise.resolve(DeviceInfoModule.getFreeDiskStorage());

/**
 * @remarks
 * See {@link getFreeDiskStorage}: `storageType` is accepted and ignored.
 */
export const getFreeDiskStorageSync = (
  _storageType?: AvailableCapacityType
): number => DeviceInfoModule.getFreeDiskStorage();

export const getFreeDiskStorageOld = asyncProp(() =>
  DeviceInfoModule.getFreeDiskStorageOld()
);
export const getFreeDiskStorageOldSync = syncProp(() =>
  DeviceInfoModule.getFreeDiskStorageOld()
);

// ============================================================================
// 7. Battery & power
// ============================================================================

export const getBatteryLevel = asyncProp(() =>
  DeviceInfoModule.getBatteryLevel()
);
export const getBatteryLevelSync = syncProp(() =>
  DeviceInfoModule.getBatteryLevel()
);

export const getPowerState = asyncProp(
  (): Partial<PowerState> => DeviceInfoModule.getPowerState()
);
export const getPowerStateSync = syncProp(
  (): Partial<PowerState> => DeviceInfoModule.getPowerState()
);

export const isBatteryCharging = asyncProp(() =>
  DeviceInfoModule.getIsBatteryCharging()
);
export const isBatteryChargingSync = syncProp(() =>
  DeviceInfoModule.getIsBatteryCharging()
);

export const isLowBatteryLevel = (level: number): boolean =>
  DeviceInfoModule.isLowBatteryLevel(level);

// ============================================================================
// 8. Network & carrier
// ============================================================================

export const getIpAddress = (): Promise<string> =>
  DeviceInfoModule.getIpAddress();
export const getIpAddressSync = (): string =>
  DeviceInfoModule.getIpAddressSync();

export const getCarrier = (): Promise<string> => DeviceInfoModule.getCarrier();
export const getCarrierSync = (): string => DeviceInfoModule.getCarrierSync();

export const isAirplaneMode = asyncProp(() =>
  DeviceInfoModule.getIsAirplaneMode()
);
export const isAirplaneModeSync = syncProp(() =>
  DeviceInfoModule.getIsAirplaneMode()
);

export const getUserAgent = (): Promise<string> =>
  DeviceInfoModule.getUserAgent();

/**
 * @remarks
 * The user agent is only available asynchronously on this package (iOS WebView
 * init). The sync variant returns `''`; use {@link getUserAgent} for the real value.
 */
export const getUserAgentSync = syncProp((): string => '');

// ============================================================================
// 9. Audio accessories
// ============================================================================

export const isHeadphonesConnected = (): Promise<boolean> =>
  DeviceInfoModule.isHeadphonesConnected();
export const isHeadphonesConnectedSync = syncProp(() =>
  DeviceInfoModule.getIsHeadphonesConnected()
);

export const isWiredHeadphonesConnected = asyncProp(() =>
  DeviceInfoModule.getIsWiredHeadphonesConnected()
);
export const isWiredHeadphonesConnectedSync = syncProp(() =>
  DeviceInfoModule.getIsWiredHeadphonesConnected()
);

export const isBluetoothHeadphonesConnected = asyncProp(() =>
  DeviceInfoModule.getIsBluetoothHeadphonesConnected()
);
export const isBluetoothHeadphonesConnectedSync = syncProp(() =>
  DeviceInfoModule.getIsBluetoothHeadphonesConnected()
);

// ============================================================================
// 10. Location & display
// ============================================================================

export const isLocationEnabled = (): Promise<boolean> =>
  DeviceInfoModule.isLocationEnabled();
export const isLocationEnabledSync = syncProp(() =>
  DeviceInfoModule.getIsLocationEnabled()
);

export const getAvailableLocationProviders = (): Promise<LocationProviderInfo> =>
  Promise.resolve(
    providersArrayToMap(DeviceInfoModule.getAvailableLocationProviders())
  );
export const getAvailableLocationProvidersSync = (): LocationProviderInfo =>
  providersArrayToMap(DeviceInfoModule.getAvailableLocationProviders());

export const getFontScale = asyncProp(() => DeviceInfoModule.getFontScale());
export const getFontScaleSync = syncProp(() =>
  DeviceInfoModule.getFontScale()
);

export const getBrightness = asyncProp(() => DeviceInfoModule.getBrightness());
export const getBrightnessSync = syncProp(() =>
  DeviceInfoModule.getBrightness()
);

// ============================================================================
// 11. iOS-specific
// ============================================================================

export const getDeviceToken = (): Promise<string> =>
  DeviceInfoModule.getDeviceToken();

// ============================================================================
// 12. Hooks
// ============================================================================

export {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useBrightness,
};

/**
 * RNDI returns `AsyncHookResult<boolean>`; the core hook returns a bare boolean.
 */
export function useIsHeadphonesConnected(): AsyncHookResult<boolean> {
  return toAsyncHookResult(useIsHeadphonesConnectedCore());
}

/**
 * RNDI returns `AsyncHookResult<boolean>`; the core hook returns a bare boolean.
 */
export function useIsWiredHeadphonesConnected(): AsyncHookResult<boolean> {
  return toAsyncHookResult(useIsWiredHeadphonesConnectedCore());
}

/**
 * RNDI returns `AsyncHookResult<boolean>`; the core hook returns a bare boolean.
 */
export function useIsBluetoothHeadphonesConnected(): AsyncHookResult<boolean> {
  return toAsyncHookResult(useIsBluetoothHeadphonesConnectedCore());
}

/**
 * Built in JS over `DeviceInfoModule.getFirstInstallTime()` (no core hook exists).
 */
export function useFirstInstallTime(): AsyncHookResult<number> {
  const [state, setState] = useState<AsyncHookResult<number>>({
    loading: true,
    result: -1,
  });

  useEffect(() => {
    let mounted = true;
    DeviceInfoModule.getFirstInstallTime()
      .then(result => {
        if (mounted) {
          setState({ loading: false, result });
        }
      })
      .catch(() => {
        if (mounted) {
          setState({ loading: false, result: -1 });
        }
      });
    return () => {
      mounted = false;
    };
  }, []);

  return state;
}

/**
 * Built in JS over `DeviceInfoModule.deviceName` (no core hook exists).
 */
export function useDeviceName(): AsyncHookResult<string> {
  const [state, setState] = useState<AsyncHookResult<string>>({
    loading: true,
    result: 'unknown',
  });

  useEffect(() => {
    setState({ loading: false, result: DeviceInfoModule.deviceName });
  }, []);

  return state;
}

/**
 * Built in JS over `DeviceInfoModule.hasSystemFeature()` (no core hook exists).
 */
export function useHasSystemFeature(
  feature: string
): AsyncHookResult<boolean> {
  const [state, setState] = useState<AsyncHookResult<boolean>>({
    loading: true,
    result: false,
  });

  useEffect(() => {
    setState({
      loading: false,
      result: DeviceInfoModule.hasSystemFeature(feature),
    });
  }, [feature]);

  return state;
}

/**
 * Built in JS over `DeviceInfoModule.isEmulator` (no core hook exists).
 */
export function useIsEmulator(): AsyncHookResult<boolean> {
  const [state, setState] = useState<AsyncHookResult<boolean>>({
    loading: true,
    result: false,
  });

  useEffect(() => {
    setState({ loading: false, result: DeviceInfoModule.isEmulator });
  }, []);

  return state;
}

/**
 * Built in JS over `DeviceInfoModule.manufacturer` (no core hook exists).
 */
export function useManufacturer(): AsyncHookResult<string> {
  const [state, setState] = useState<AsyncHookResult<string>>({
    loading: true,
    result: 'unknown',
  });

  useEffect(() => {
    setState({ loading: false, result: DeviceInfoModule.manufacturer });
  }, []);

  return state;
}

// ============================================================================
// Default export — RNDI's `DeviceInfo` aggregate object
// ============================================================================

/**
 * Aggregate object matching RNDI's default `DeviceInfo` export. Every named
 * function plus every hook is reachable as a method, e.g. `DeviceInfo.getModel()`.
 */
const DeviceInfo = {
  getUniqueId,
  getUniqueIdSync,
  syncUniqueId,
  getDeviceId,
  getModel,
  getBrand,
  getManufacturer,
  getManufacturerSync,
  getDeviceName,
  getDeviceNameSync,
  getDeviceType,
  getDeviceTypeSync,
  getSerialNumber,
  getSerialNumberSync,
  getAndroidId,
  getAndroidIdSync,
  getMacAddress,
  getMacAddressSync,
  getInstanceId,
  getInstanceIdSync,
  getAppSetId,
  getSystemName,
  getSystemVersion,
  getApiLevel,
  getApiLevelSync,
  getBuildId,
  getBuildIdSync,
  getBaseOs,
  getBaseOsSync,
  getBootloader,
  getBootloaderSync,
  getCodename,
  getCodenameSync,
  getDevice,
  getDeviceSync,
  getDisplay,
  getDisplaySync,
  getFingerprint,
  getFingerprintSync,
  getHardware,
  getHardwareSync,
  getHost,
  getHostSync,
  getProduct,
  getProductSync,
  getTags,
  getTagsSync,
  getType,
  getTypeSync,
  getIncremental,
  getIncrementalSync,
  getSecurityPatch,
  getSecurityPatchSync,
  getPreviewSdkInt,
  getPreviewSdkIntSync,
  getHostNames,
  getHostNamesSync,
  getVersion,
  getBuildNumber,
  getBundleId,
  getApplicationName,
  getReadableVersion,
  getInstallerPackageName,
  getInstallerPackageNameSync,
  getInstallReferrer,
  getInstallReferrerSync,
  getFirstInstallTime,
  getFirstInstallTimeSync,
  getLastUpdateTime,
  getLastUpdateTimeSync,
  getStartupTime,
  getStartupTimeSync,
  isEmulator,
  isEmulatorSync,
  isTablet,
  isLowRamDevice,
  isDisplayZoomed,
  isPinOrFingerprintSet,
  isPinOrFingerprintSetSync,
  isCameraPresent,
  isCameraPresentSync,
  hasNotch,
  hasDynamicIsland,
  hasGms,
  hasGmsSync,
  hasHms,
  hasHmsSync,
  hasSystemFeature,
  hasSystemFeatureSync,
  getSystemAvailableFeatures,
  getSystemAvailableFeaturesSync,
  getSupportedMediaTypeList,
  getSupportedMediaTypeListSync,
  isLandscape,
  isLandscapeSync,
  isTabletMode,
  isMouseConnected,
  isMouseConnectedSync,
  isKeyboardConnected,
  isKeyboardConnectedSync,
  supportedAbis,
  supportedAbisSync,
  supported32BitAbis,
  supported32BitAbisSync,
  supported64BitAbis,
  supported64BitAbisSync,
  getTotalMemory,
  getTotalMemorySync,
  getUsedMemory,
  getUsedMemorySync,
  getMaxMemory,
  getMaxMemorySync,
  getTotalDiskCapacity,
  getTotalDiskCapacitySync,
  getTotalDiskCapacityOld,
  getTotalDiskCapacityOldSync,
  getFreeDiskStorage,
  getFreeDiskStorageSync,
  getFreeDiskStorageOld,
  getFreeDiskStorageOldSync,
  getBatteryLevel,
  getBatteryLevelSync,
  getPowerState,
  getPowerStateSync,
  isBatteryCharging,
  isBatteryChargingSync,
  isLowBatteryLevel,
  getIpAddress,
  getIpAddressSync,
  getCarrier,
  getCarrierSync,
  isAirplaneMode,
  isAirplaneModeSync,
  getUserAgent,
  getUserAgentSync,
  isHeadphonesConnected,
  isHeadphonesConnectedSync,
  isWiredHeadphonesConnected,
  isWiredHeadphonesConnectedSync,
  isBluetoothHeadphonesConnected,
  isBluetoothHeadphonesConnectedSync,
  isLocationEnabled,
  isLocationEnabledSync,
  getAvailableLocationProviders,
  getAvailableLocationProvidersSync,
  getFontScale,
  getFontScaleSync,
  getBrightness,
  getBrightnessSync,
  getDeviceToken,
  // Hooks (RNDI re-exposes these as methods on the default object)
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useBrightness,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useFirstInstallTime,
  useDeviceName,
  useHasSystemFeature,
  useIsEmulator,
  useManufacturer,
};

export type {
  AsyncHookResult,
  AppSetIdInfo,
  AvailableCapacityType,
  LocationProviderInfo,
  PowerState,
};

/**
 * Named alias of the aggregate object. RNDI exports `DeviceInfo` both as the
 * default and as a named const, so `import { DeviceInfo } from '.../compat'`
 * also resolves.
 */
export { DeviceInfo };

export default DeviceInfo;
