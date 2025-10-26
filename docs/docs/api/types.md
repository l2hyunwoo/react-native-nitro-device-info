# Type Definitions

Complete TypeScript type definitions for `react-native-nitro-device-info`.

## Importing Types

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';
```

## Core Types

### PowerState

Complete power and battery state information.

```typescript
interface PowerState {
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
   * @platform iOS only - always false on Android
   */
  lowPowerMode: boolean;
}
```

**Usage**:

```typescript
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(`Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode ? 'Yes' : 'No'}`);
```

**Fields**:

- **batteryLevel**: Number from 0.0 (0%) to 1.0 (100%)
- **batteryState**: Current charging state (see BatteryState below)
- **lowPowerMode**: iOS only - indicates if Low Power Mode is enabled

### BatteryState

Battery charging status.

```typescript
type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';
```

**Values**:

- **unknown**: Battery state cannot be determined
- **unplugged**: Battery is discharging (not plugged in)
- **charging**: Battery is currently charging
- **full**: Battery is fully charged (may still be plugged in)

**Usage**:

```typescript
const powerState = DeviceInfoModule.getPowerState();

switch (powerState.batteryState) {
  case 'charging':
    console.log('Device is charging');
    break;
  case 'full':
    console.log('Battery is full');
    break;
  case 'unplugged':
    console.log('Device is running on battery');
    break;
  case 'unknown':
    console.log('Battery state unknown');
    break;
}
```

### DeviceType

Device category classification.

```typescript
type DeviceType =
  | 'Handset'        // Smartphone
  | 'Tablet'         // Tablet device
  | 'Tv'             // TV or set-top box
  | 'Desktop'        // Desktop computer
  | 'GamingConsole'  // Gaming console
  | 'unknown';       // Unknown device type
```

**Values**:

- **Handset**: Standard smartphone
- **Tablet**: Tablet device (iPad, Android tablets)
- **Tv**: Smart TV or set-top box
- **Desktop**: Desktop or laptop computer
- **GamingConsole**: Gaming console
- **unknown**: Device type cannot be determined

**Usage**:

```typescript
const deviceType: DeviceType = DeviceInfoModule.deviceType;

if (deviceType === 'Tablet') {
  // Apply tablet-specific layout
  console.log('Tablet detected, using tablet layout');
} else if (deviceType === 'Handset') {
  // Apply phone-specific layout
  console.log('Phone detected, using mobile layout');
}
```

**Platform Behavior**:

- **iOS**: Accurately detects iPhone, iPad, Apple TV
- **Android**: Uses screen size heuristics (>= 600dp smallest width = Tablet)

## DeviceInfo Interface

The main module interface providing all device information methods.

```typescript
interface DeviceInfo extends HybridObject {
  // Core Device Properties
  readonly deviceId: string;
  readonly brand: string;
  readonly systemName: string;
  readonly systemVersion: string;
  readonly model: string;
  readonly deviceType: DeviceType;

  // Application Properties
  readonly readableVersion: string;
  readonly installerPackageName: string;
  readonly startupTime: number;

  // Android Build Properties
  readonly serialNumber: string;
  readonly androidId: string;
  readonly securityPatch: string;
  readonly bootloader: string;
  readonly codename: string;
  readonly device: string;
  readonly display: string;
  readonly fingerprint: string;
  readonly hardware: string;
  readonly host: string;
  readonly product: string;
  readonly tags: string;
  readonly type: string;
  readonly baseOs: string;
  readonly previewSdkInt: number;
  readonly incremental: string;
  readonly buildId: string;

  // Synchronous Cached Network Properties
  readonly ipAddressSync: string;
  readonly macAddressSync: string;
  readonly carrierSync: string;
  readonly firstInstallTimeSync: number;
  readonly lastUpdateTimeSync: number;
  readonly isLocationEnabledSync: boolean;
  readonly isHeadphonesConnectedSync: boolean;

  // Device Capability Methods
  isTablet(): boolean;
  hasNotch(): boolean;
  hasDynamicIsland(): boolean;
  isCameraPresent(): boolean;
  isPinOrFingerprintSet(): boolean;
  isEmulator(): boolean;

  // Device Identification Methods
  getUniqueId(): string;
  getManufacturer(): string;

  // System Resource Methods
  getTotalMemory(): number;
  getUsedMemory(): number;
  getTotalDiskCapacity(): number;
  getFreeDiskStorage(): number;
  getTotalDiskCapacityOld(): number;
  getFreeDiskStorageOld(): number;

  // Battery Methods
  getBatteryLevel(): number;
  getPowerState(): PowerState;
  isBatteryCharging(): boolean;
  isLowBatteryLevel(threshold: number): boolean;

  // Application Metadata Methods
  getVersion(): string;
  getBuildNumber(): string;
  getBundleId(): string;
  getApplicationName(): string;
  getFirstInstallTime(): Promise<number>;
  getLastUpdateTime(): Promise<number>;

  // Network & Connectivity Methods (Async)
  getIpAddress(): Promise<string>;
  getMacAddress(): Promise<string>;
  getCarrier(): Promise<string>;
  isLocationEnabled(): Promise<boolean>;
  isHeadphonesConnected(): Promise<boolean>;
  getUserAgent(): Promise<string>;
  getDeviceName(): string;

  // Platform-Specific Methods
  getApiLevel(): number;
  getSupportedAbis(): string[];
  getSupported32BitAbis(): string[];
  getSupported64BitAbis(): string[];
  hasGms(): boolean;
  hasHms(): boolean;
  getFontScale(): number;
  hasSystemFeature(feature: string): boolean;
  getSystemAvailableFeatures(): string[];
  getAvailableLocationProviders(): Record<string, boolean>;
  getMaxMemory(): number;
  getSupportedMediaTypeList(): string[];

  // Installation Methods
  getInstallReferrer(): Promise<string>;

  // Advanced Capability Methods
  isWiredHeadphonesConnected(): boolean;
  isBluetoothHeadphonesConnected(): boolean;
  isAirplaneMode(): boolean;
  isLowRamDevice(): boolean;
  isLandscape(): boolean;
  isMouseConnected(): boolean;
  isKeyboardConnected(): boolean;
  isTabletMode(): boolean;
  getHostNames(): string[];

  // iOS-Specific Methods
  isDisplayZoomed(): boolean;
  getBrightness(): number;
  getDeviceToken(): Promise<string>;
  syncUniqueId(): Promise<string>;
}
```

## Usage Examples

### Type-Safe Power State

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

function getBatteryStatus(): string {
  const powerState: PowerState = DeviceInfoModule.getPowerState();

  const percentage = (powerState.batteryLevel * 100).toFixed(0);
  const state: BatteryState = powerState.batteryState;

  let statusMessage = `Battery: ${percentage}%`;

  if (state === 'charging') {
    statusMessage += ' (Charging)';
  } else if (state === 'full') {
    statusMessage += ' (Full)';
  }

  if (powerState.lowPowerMode) {
    statusMessage += ' [Low Power Mode]';
  }

  return statusMessage;
}
```

### Type-Safe Device Type Handling

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { DeviceType } from 'react-native-nitro-device-info';

function getLayoutMode(): 'mobile' | 'tablet' | 'desktop' {
  const deviceType: DeviceType = DeviceInfoModule.deviceType;

  switch (deviceType) {
    case 'Handset':
      return 'mobile';
    case 'Tablet':
      return 'tablet';
    case 'Desktop':
      return 'desktop';
    default:
      return 'mobile'; // Default to mobile for unknown types
  }
}
```

### Custom Type Aliases

You can create your own type aliases for convenience:

```typescript
import type { DeviceInfo } from 'react-native-nitro-device-info';

// Alias for device info
type DI = DeviceInfo;

// Custom types for your app
type DeviceCapabilities = {
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  isTablet: boolean;
  isEmulator: boolean;
};

function getDeviceCapabilities(): DeviceCapabilities {
  return {
    hasNotch: DeviceInfoModule.hasNotch(),
    hasDynamicIsland: DeviceInfoModule.hasDynamicIsland(),
    isTablet: DeviceInfoModule.isTablet(),
    isEmulator: DeviceInfoModule.isEmulator(),
  };
}
```

## TypeScript Configuration

Ensure your `tsconfig.json` is configured correctly:

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## Type Safety Benefits

### IntelliSense Support

Full autocomplete for all methods and properties:

```typescript
// TypeScript knows all available methods
DeviceInfoModule.get // Shows all available getters
DeviceInfoModule.is  // Shows all available boolean checks
```

### Compile-Time Error Checking

```typescript
// Error: Property 'invalid' does not exist
const invalid = DeviceInfoModule.invalid;

// Error: Expected 1 argument, got 0
const isLow = DeviceInfoModule.isLowBatteryLevel();

// Error: Argument of type 'string' not assignable to 'number'
const isLow = DeviceInfoModule.isLowBatteryLevel('0.2');
```

### Type Guards

```typescript
function checkBatteryState(state: BatteryState): string {
  // TypeScript ensures you handle all cases
  switch (state) {
    case 'unknown':
      return 'Battery state unknown';
    case 'unplugged':
      return 'Running on battery';
    case 'charging':
      return 'Charging';
    case 'full':
      return 'Fully charged';
    // TypeScript error if any case is missing
  }
}
```

## Next Steps

- View the [Complete API Reference](/api/device-info) for all available methods
- Check out [Usage Examples](/examples/basic-usage)
- Read the [Migration Guide](/api/migration) for upgrading from other libraries
