# Showcase App

Comprehensive demonstration app showcasing all 80+ device properties from react-native-nitro-device-info, organized into 10 logical categories with a clean, collapsible interface.

## Features

- **80+ Device Properties**: Access all device information from the DeviceInfo interface
- **10 Categories**: Properties organized into logical groups:
  - Device Identity (deviceId, brand, model, systemName, systemVersion, deviceType)
  - Device Capabilities (isTablet, hasNotch, hasDynamicIsland, isCameraPresent, isEmulator)
  - Device Identification (getUniqueId, androidId, serialNumber, getManufacturer)
  - Battery & Power (getBatteryLevel, isBatteryCharging, getPowerState, lowPowerMode)
  - System Resources (getTotalMemory, getUsedMemory, getTotalDiskCapacity, getFreeDiskStorage)
  - Application Metadata (getVersion, getBuildNumber, getBundleId, getApplicationName)
  - Network & Connectivity (getIpAddress, getMacAddress, getCarrier, isLocationEnabled, isHeadphonesConnected)
  - Platform Capabilities (getApiLevel, getSupportedAbis, hasGms, hasHms)
  - Android Build Information (bootloader, codename, device, display, fingerprint, hardware, host, product, tags, type)
  - Advanced Features (getFirstInstallTime, getLastUpdateTime, getInstallReferrer)
- **Collapsible Sections**: All categories start collapsed - tap to expand
- **Platform Badges**: iOS/Android-only properties clearly marked
- **Type-Aware Formatting**:
  - Booleans displayed with checkmarks (✓/✗)
  - Bytes formatted as GB/MB
  - Timestamps as human-readable dates
  - Objects/arrays pretty-printed as JSON
- **Pull to Refresh**: Update all properties on demand
- **Error Handling**: Graceful degradation for unavailable properties
- **Zero Dependencies**: NO React Navigation - uses only React Native built-in components

## Architecture

Built using atomic component architecture for maintainability:

```
DeviceInfoScreen.tsx (main screen)
└── CategorySection.tsx (collapsible category)
    └── PropertyRow.tsx (key-value row)
        ├── PlatformBadge.tsx (iOS/Android indicator)
        └── PropertyFormatter.tsx (type-aware value display)
```

### Key Implementation Details

- **Synchronous vs Async Properties**: Properties accessed directly (e.g., `deviceInfo.deviceId`) or called as functions (e.g., `await deviceInfo.getUniqueId()`)
- **State Management**: Local component state with useState hooks
- **Animations**: React Native LayoutAnimation for smooth expand/collapse
- **Styling**: Platform-specific styles with shadow/elevation support

## Running the App

### From Repository Root

```bash
yarn showcase ios      # iOS
yarn showcase android  # Android
```

### From Showcase Directory

```bash
cd example/showcase
yarn ios      # iOS
yarn android  # Android
```

## Usage

1. Launch the app on your device or simulator
2. Tap any category header to expand and view properties
3. Pull down to refresh all property values
4. Properties are color-coded by type (booleans in bold, numbers in monospace, etc.)
5. Platform-specific properties show iOS or Android badges

## Development

The showcase app serves as both a demonstration and testing tool for the library:

- **Component Testing**: Verify all 80+ properties return expected values
- **Platform Coverage**: Test iOS-only and Android-only properties
- **Type Safety**: All components fully typed with TypeScript
- **Error Boundaries**: Individual property errors don't crash the app
