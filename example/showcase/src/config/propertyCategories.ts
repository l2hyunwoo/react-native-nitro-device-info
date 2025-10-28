/**
 * Property Category Configuration
 * Maps DeviceInfo properties to organized categories for display
 */

import { PropertyCategory, PropertyType, PlatformAvailability } from '../types';
import type { DeviceProperty } from '../types';
import { Platform } from 'react-native';

/**
 * Complete mapping of all DeviceInfo properties organized by category
 * Excludes 'value' and 'errorState' which are populated at runtime
 */
export const PROPERTY_CONFIGS: Omit<DeviceProperty, 'value' | 'errorState'>[] = [
  // ==========================================================================
  // CATEGORY 1: Device Identity
  // ==========================================================================
  {
    key: 'deviceId',
    label: 'Device ID',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'brand',
    label: 'Brand',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'model',
    label: 'Model',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'systemName',
    label: 'System Name',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'systemVersion',
    label: 'System Version',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'deviceType',
    label: 'Device Type',
    category: PropertyCategory.DEVICE_IDENTITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 2: Device Capabilities
  // ==========================================================================
  {
    key: 'isTablet',
    label: 'Is Tablet',
    category: PropertyCategory.DEVICE_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'hasNotch',
    label: 'Has Notch',
    category: PropertyCategory.DEVICE_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'hasDynamicIsland',
    label: 'Has Dynamic Island',
    category: PropertyCategory.DEVICE_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.IOS_ONLY,
    isSync: true,
  },
  {
    key: 'isCameraPresent',
    label: 'Has Camera',
    category: PropertyCategory.DEVICE_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'isEmulator',
    label: 'Is Emulator',
    category: PropertyCategory.DEVICE_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 3: Device Identification
  // ==========================================================================
  {
    key: 'uniqueId',
    label: 'Unique ID',
    category: PropertyCategory.DEVICE_IDENTIFICATION,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'androidId',
    label: 'Android ID',
    category: PropertyCategory.DEVICE_IDENTIFICATION,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'serialNumber',
    label: 'Serial Number',
    category: PropertyCategory.DEVICE_IDENTIFICATION,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'manufacturer',
    label: 'Manufacturer',
    category: PropertyCategory.DEVICE_IDENTIFICATION,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 4: Battery & Power
  // ==========================================================================
  {
    key: 'batteryLevel',
    label: 'Battery Level',
    category: PropertyCategory.BATTERY_POWER,
    type: PropertyType.NUMBER,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'isBatteryCharging',
    label: 'Is Charging',
    category: PropertyCategory.BATTERY_POWER,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'powerState',
    label: 'Power State',
    category: PropertyCategory.BATTERY_POWER,
    type: PropertyType.OBJECT,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'lowPowerMode',
    label: 'Low Power Mode',
    category: PropertyCategory.BATTERY_POWER,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.IOS_ONLY,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 5: System Resources
  // ==========================================================================
  {
    key: 'totalMemory',
    label: 'Total Memory',
    category: PropertyCategory.SYSTEM_RESOURCES,
    type: PropertyType.BYTES,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'usedMemory',
    label: 'Used Memory',
    category: PropertyCategory.SYSTEM_RESOURCES,
    type: PropertyType.BYTES,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'totalDiskCapacity',
    label: 'Total Disk Capacity',
    category: PropertyCategory.SYSTEM_RESOURCES,
    type: PropertyType.BYTES,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'freeDiskStorage',
    label: 'Free Disk Storage',
    category: PropertyCategory.SYSTEM_RESOURCES,
    type: PropertyType.BYTES,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 6: Application Metadata
  // ==========================================================================
  {
    key: 'version',
    label: 'App Version',
    category: PropertyCategory.APP_METADATA,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'buildNumber',
    label: 'Build Number',
    category: PropertyCategory.APP_METADATA,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'bundleId',
    label: 'Bundle ID',
    category: PropertyCategory.APP_METADATA,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },
  {
    key: 'applicationName',
    label: 'Application Name',
    category: PropertyCategory.APP_METADATA,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 7: Network & Connectivity
  // ==========================================================================
  {
    key: 'getIpAddress',
    label: 'IP Address',
    category: PropertyCategory.NETWORK_CONNECTIVITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'getMacAddress',
    label: 'MAC Address',
    category: PropertyCategory.NETWORK_CONNECTIVITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'getCarrier',
    label: 'Carrier',
    category: PropertyCategory.NETWORK_CONNECTIVITY,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'isLocationEnabled',
    label: 'Location Enabled',
    category: PropertyCategory.NETWORK_CONNECTIVITY,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'isHeadphonesConnected',
    label: 'Headphones Connected',
    category: PropertyCategory.NETWORK_CONNECTIVITY,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },

  // ==========================================================================
  // CATEGORY 8: Platform Capabilities
  // ==========================================================================
  {
    key: 'apiLevel',
    label: 'API Level',
    category: PropertyCategory.PLATFORM_CAPABILITIES,
    type: PropertyType.NUMBER,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'supportedAbis',
    label: 'Supported ABIs',
    category: PropertyCategory.PLATFORM_CAPABILITIES,
    type: PropertyType.ARRAY,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'hasGms',
    label: 'Has Google Services',
    category: PropertyCategory.PLATFORM_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'hasHms',
    label: 'Has Huawei Services',
    category: PropertyCategory.PLATFORM_CAPABILITIES,
    type: PropertyType.BOOLEAN,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 9: Android Build Information
  // ==========================================================================
  {
    key: 'bootloader',
    label: 'Bootloader',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'codename',
    label: 'Codename',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'device',
    label: 'Device',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'display',
    label: 'Display',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'fingerprint',
    label: 'Fingerprint',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'hardware',
    label: 'Hardware',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'host',
    label: 'Host',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'product',
    label: 'Product',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'tags',
    label: 'Tags',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },
  {
    key: 'type',
    label: 'Type',
    category: PropertyCategory.ANDROID_BUILD_INFO,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: true,
  },

  // ==========================================================================
  // CATEGORY 10: Advanced Features
  // ==========================================================================
  {
    key: 'getFirstInstallTime',
    label: 'First Install Time',
    category: PropertyCategory.ADVANCED_FEATURES,
    type: PropertyType.TIMESTAMP,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'getLastUpdateTime',
    label: 'Last Update Time',
    category: PropertyCategory.ADVANCED_FEATURES,
    type: PropertyType.TIMESTAMP,
    platform: PlatformAvailability.ALL,
    isSync: false,
  },
  {
    key: 'getInstallReferrer',
    label: 'Install Referrer',
    category: PropertyCategory.ADVANCED_FEATURES,
    type: PropertyType.STRING,
    platform: PlatformAvailability.ANDROID_ONLY,
    isSync: false,
  },
];

/**
 * Helper function to check if a property is supported on the current platform
 */
export function isPlatformSupported(property: Pick<DeviceProperty, 'platform'>): boolean {
  if (property.platform === PlatformAvailability.ALL) return true;
  if (property.platform === PlatformAvailability.IOS_ONLY) return Platform.OS === 'ios';
  if (property.platform === PlatformAvailability.ANDROID_ONLY) return Platform.OS === 'android';
  return false;
}

/**
 * Get all properties for a specific category, filtered by current platform
 */
export function getPropertiesForCategory(category: PropertyCategory): Omit<DeviceProperty, 'value' | 'errorState'>[] {
  return PROPERTY_CONFIGS.filter(
    (prop) => prop.category === category && isPlatformSupported(prop)
  );
}

/**
 * Get unique list of all categories that have properties on current platform
 */
export function getAvailableCategories(): PropertyCategory[] {
  const categories = new Set<PropertyCategory>();
  PROPERTY_CONFIGS.forEach((prop) => {
    if (isPlatformSupported(prop)) {
      categories.add(prop.category);
    }
  });
  return Array.from(categories).sort();
}
