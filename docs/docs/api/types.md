# Type Definitions

Complete TypeScript type definitions for `react-native-nitro-device-info`.

## Importing Types

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
  NavigationMode,
} from 'react-native-nitro-device-info';
```

## Core Types

### PowerState

Complete power and battery state information.

```typescript
interface PowerState {
  /**
   * Battery charge level (0.0 to 1.0, or -1 when unavailable)
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

console.log(powerState.batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode ? 'Yes' : 'No'}`);
```

**Fields**:

- **batteryLevel**: Number from 0.0 (0%) to 1.0 (100%), or `-1` when unavailable
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

### NavigationMode

Android navigation mode types.

```typescript
type NavigationMode = 'gesture' | 'buttons' | 'twobuttons' | 'unknown';
```

**Values**:

- **gesture**: Full gesture navigation (swipe-based)
- **buttons**: Traditional 3-button navigation (Back, Home, Recent)
- **twobuttons**: 2-button navigation (Back, Home with swipe up)
- **unknown**: Cannot determine (always returns this on iOS)

**Usage**:

```typescript
const navMode = DeviceInfoModule.navigationMode;

switch (navMode) {
  case 'gesture':
    console.log('Device uses gesture navigation');
    // Add extra bottom padding for gesture conflicts
    break;
  case 'buttons':
    console.log('Device uses 3-button navigation');
    break;
  case 'twobuttons':
    console.log('Device uses 2-button navigation');
    break;
  case 'unknown':
    console.log('Navigation mode unknown (iOS)');
    break;
}
```

**Platform Behavior**:

- **Android API 29+**: Returns actual navigation mode
- **Android API < 29**: Returns `"buttons"` (gesture nav didn't exist)
- **iOS**: Always returns `"unknown"`

### DeviceType

Device category classification.

```typescript
type DeviceType =
  | 'Handset' // Smartphone
  | 'Tablet' // Tablet device
  | 'Tv' // TV or set-top box
  | 'Desktop' // Desktop computer
  | 'GamingConsole' // Gaming console
  | 'unknown'; // Unknown device type
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

Import the published interface rather than copying its declaration into your app:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { DeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo: DeviceInfo = DeviceInfoModule;
const model: string = deviceInfo.model;
const hasGms: boolean = deviceInfo.getHasGms();
```

`DeviceInfo` is a type, not a runtime singleton. Use `DeviceInfoModule` to read values.

The complete signature source is [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts). Check your installed release's declarations when it differs from the current website. See [DeviceInfo Module](/api/device-info) for return values and platform behavior.

## Usage Examples

### Type-Safe Power State

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

function getBatteryStatus(): string {
  const powerState: PowerState = DeviceInfoModule.getPowerState();

  if (powerState.batteryLevel < 0) return 'Battery: unavailable';
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
    hasNotch: DeviceInfoModule.getHasNotch(),
    hasDynamicIsland: DeviceInfoModule.getHasDynamicIsland(),
    isTablet: DeviceInfoModule.isTablet,
    isEmulator: DeviceInfoModule.isEmulator,
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
const model: string = DeviceInfoModule.model;
const charging: boolean = DeviceInfoModule.getIsBatteryCharging();
```

### Compile-Time Error Checking

```typescript
// Intentional type errors: do not copy these into working code.
// @ts-expect-error Property 'invalid' does not exist
const invalid = DeviceInfoModule.invalid;

// @ts-expect-error Expected 1 argument, got 0
const missingThreshold = DeviceInfoModule.isLowBatteryLevel();

// @ts-expect-error Threshold must be a number
const invalidThreshold = DeviceInfoModule.isLowBatteryLevel('0.2');
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
