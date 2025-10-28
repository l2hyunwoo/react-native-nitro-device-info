/**
 * Benchmark Method Configuration
 * Defines which methods to benchmark and their parameters
 */

import type { BenchmarkMethodConfig } from '../types';
import { createDeviceInfo } from 'react-native-nitro-device-info';
// @ts-ignore - react-native-device-info is a peer dependency that may not be installed during type checking
import DeviceInfo from 'react-native-device-info';

// Performance targets
const SYNC_TARGET = 1; // <1ms for synchronous methods
const ASYNC_TARGET = 100; // <100ms for asynchronous methods

// Iteration counts
const SYNC_ITERATIONS = 1000;
const ASYNC_ITERATIONS = 10;

/**
 * Complete list of methods to benchmark
 * Compares react-native-nitro-device-info with react-native-device-info
 */
export const BENCHMARK_METHODS: BenchmarkMethodConfig[] = [
  // Synchronous Device Identity Methods
  {
    name: 'deviceId',
    nitroFn: () => createDeviceInfo().deviceId,
    deviceInfoFn: () => DeviceInfo.getDeviceId(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'brand',
    nitroFn: () => createDeviceInfo().brand,
    deviceInfoFn: () => DeviceInfo.getBrand(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'model',
    nitroFn: () => createDeviceInfo().model,
    deviceInfoFn: () => DeviceInfo.getModel(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'systemName',
    nitroFn: () => createDeviceInfo().systemName,
    deviceInfoFn: () => DeviceInfo.getSystemName(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'systemVersion',
    nitroFn: () => createDeviceInfo().systemVersion,
    deviceInfoFn: () => DeviceInfo.getSystemVersion(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Synchronous Device Capabilities
  {
    name: 'isTablet',
    nitroFn: () => createDeviceInfo().isTablet,
    deviceInfoFn: () => DeviceInfo.isTablet(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'hasNotch',
    nitroFn: () => createDeviceInfo().hasNotch,
    deviceInfoFn: () => DeviceInfo.hasNotch(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'isEmulator',
    nitroFn: () => createDeviceInfo().isEmulator,
    deviceInfoFn: () => DeviceInfo.isEmulator(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Synchronous Device Identification
  {
    name: 'uniqueId',
    nitroFn: () => createDeviceInfo().uniqueId,
    deviceInfoFn: () => DeviceInfo.getUniqueId(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'manufacturer',
    nitroFn: () => createDeviceInfo().manufacturer,
    deviceInfoFn: () => DeviceInfo.getManufacturer(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Synchronous Battery & Power
  {
    name: 'batteryLevel',
    nitroFn: () => createDeviceInfo().batteryLevel,
    deviceInfoFn: () => DeviceInfo.getBatteryLevel(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'isBatteryCharging',
    nitroFn: () => createDeviceInfo().isBatteryCharging,
    deviceInfoFn: () => DeviceInfo.isBatteryCharging(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'powerState',
    nitroFn: () => createDeviceInfo().powerState,
    deviceInfoFn: () => DeviceInfo.getPowerState(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Synchronous System Resources
  {
    name: 'totalMemory',
    nitroFn: () => createDeviceInfo().totalMemory,
    deviceInfoFn: () => DeviceInfo.getTotalMemory(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'usedMemory',
    nitroFn: () => createDeviceInfo().usedMemory,
    deviceInfoFn: () => DeviceInfo.getUsedMemory(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'totalDiskCapacity',
    nitroFn: () => createDeviceInfo().totalDiskCapacity,
    deviceInfoFn: () => DeviceInfo.getTotalDiskCapacity(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'freeDiskStorage',
    nitroFn: () => createDeviceInfo().freeDiskStorage,
    deviceInfoFn: () => DeviceInfo.getFreeDiskStorage(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Synchronous Application Metadata
  {
    name: 'version',
    nitroFn: () => createDeviceInfo().version,
    deviceInfoFn: () => DeviceInfo.getVersion(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'buildNumber',
    nitroFn: () => createDeviceInfo().buildNumber,
    deviceInfoFn: () => DeviceInfo.getBuildNumber(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'bundleId',
    nitroFn: () => createDeviceInfo().bundleId,
    deviceInfoFn: () => DeviceInfo.getBundleId(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },
  {
    name: 'applicationName',
    nitroFn: () => createDeviceInfo().applicationName,
    deviceInfoFn: () => DeviceInfo.getApplicationName(),
    isAsync: false,
    iterations: SYNC_ITERATIONS,
    target: SYNC_TARGET,
  },

  // Asynchronous Network & Connectivity
  {
    name: 'getIpAddress',
    nitroFn: () => createDeviceInfo().getIpAddress(),
    deviceInfoFn: () => DeviceInfo.getIpAddress(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },
  {
    name: 'getMacAddress',
    nitroFn: () => createDeviceInfo().getMacAddress(),
    deviceInfoFn: () => DeviceInfo.getMacAddress(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },
  {
    name: 'getCarrier',
    nitroFn: () => createDeviceInfo().getCarrier(),
    deviceInfoFn: () => DeviceInfo.getCarrier(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },
  {
    name: 'isLocationEnabled',
    nitroFn: () => createDeviceInfo().isLocationEnabled(),
    deviceInfoFn: () => DeviceInfo.isLocationEnabled(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },

  // Asynchronous Advanced Features
  {
    name: 'getFirstInstallTime',
    nitroFn: () => createDeviceInfo().getFirstInstallTime(),
    deviceInfoFn: () => DeviceInfo.getFirstInstallTime(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },
  {
    name: 'getLastUpdateTime',
    nitroFn: () => createDeviceInfo().getLastUpdateTime(),
    deviceInfoFn: () => DeviceInfo.getLastUpdateTime(),
    isAsync: true,
    iterations: ASYNC_ITERATIONS,
    target: ASYNC_TARGET,
  },
];

/**
 * Get synchronous methods only
 */
export function getSyncMethods(): BenchmarkMethodConfig[] {
  return BENCHMARK_METHODS.filter((m) => !m.isAsync);
}

/**
 * Get asynchronous methods only
 */
export function getAsyncMethods(): BenchmarkMethodConfig[] {
  return BENCHMARK_METHODS.filter((m) => m.isAsync);
}

/**
 * Get total method count
 */
export function getTotalMethodCount(): number {
  return BENCHMARK_METHODS.length;
}
