# React Hooks

React hooks for monitoring runtime device properties. These hooks provide reactive access to device state, automatically re-rendering your components when values change.

## Import

```typescript
import {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';
```

---

## Battery Hooks

### `useBatteryLevel()`

Monitor battery level changes in real-time.

```typescript
function useBatteryLevel(): number | null
```

**Returns**: Battery level (0.0 to 1.0), or `null` during initial load.

**Platform Support**:
| Platform | Supported |
|----------|-----------|
| iOS | ✅ |
| Android | ✅ |

**Example**:

```tsx
import { useBatteryLevel } from 'react-native-nitro-device-info';

function BatteryIndicator() {
  const batteryLevel = useBatteryLevel();

  if (batteryLevel === null) {
    return <Text>Loading...</Text>;
  }

  return <Text>Battery: {Math.round(batteryLevel * 100)}%</Text>;
}
```

---

### `useBatteryLevelIsLow()`

Monitor for low battery conditions with platform-specific thresholds.

```typescript
function useBatteryLevelIsLow(): number | null
```

**Returns**: Battery level when below threshold, or `null` if battery is not low.

**Thresholds**:
- **iOS**: 20% (matches iOS low power mode trigger)
- **Android**: 15% (matches Android low battery warning)

**Platform Support**:
| Platform | Supported |
|----------|-----------|
| iOS | ✅ |
| Android | ✅ |

**Example**:

```tsx
import { useBatteryLevelIsLow } from 'react-native-nitro-device-info';

function LowBatteryWarning() {
  const lowBattery = useBatteryLevelIsLow();

  if (lowBattery !== null) {
    return (
      <View style={styles.warning}>
        <Text>Low Battery: {Math.round(lowBattery * 100)}%</Text>
      </View>
    );
  }

  return null;
}
```

---

### `usePowerState()`

Monitor comprehensive power state including battery level, charging status, and low power mode.

```typescript
function usePowerState(): Partial<PowerState>
```

**Returns**: `PowerState` object with:
- `batteryLevel: number` - Battery charge level (0.0 to 1.0)
- `batteryState: BatteryState` - Charging status ('unknown', 'unplugged', 'charging', 'full')
- `lowPowerMode: boolean` - Whether low power mode is enabled (iOS only)

**Platform Support**:
| Platform | Supported | Notes |
|----------|-----------|-------|
| iOS | ✅ | Full support including lowPowerMode |
| Android | ✅ | lowPowerMode always false |

**Example**:

```tsx
import { usePowerState } from 'react-native-nitro-device-info';

function PowerStatus() {
  const powerState = usePowerState();

  return (
    <View>
      <Text>Level: {Math.round((powerState.batteryLevel ?? 0) * 100)}%</Text>
      <Text>Status: {powerState.batteryState ?? 'unknown'}</Text>
      <Text>Low Power: {powerState.lowPowerMode ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

---

## Headphone Hooks

### `useIsHeadphonesConnected()`

Monitor headphone connection state (wired or Bluetooth).

```typescript
function useIsHeadphonesConnected(): boolean
```

**Returns**: `true` if any headphones are connected, `false` otherwise.

**Platform Support**:
| Platform | Supported |
|----------|-----------|
| iOS | ✅ |
| Android | ✅ |

**Example**:

```tsx
import { useIsHeadphonesConnected } from 'react-native-nitro-device-info';

function AudioOutput() {
  const headphonesConnected = useIsHeadphonesConnected();

  return (
    <Text>
      Audio: {headphonesConnected ? 'Headphones' : 'Speaker'}
    </Text>
  );
}
```

---

### `useIsWiredHeadphonesConnected()`

Monitor wired headphone connection state.

```typescript
function useIsWiredHeadphonesConnected(): boolean
```

**Returns**: `true` if wired headphones are connected, `false` otherwise.

**Platform Support**:
| Platform | Supported |
|----------|-----------|
| iOS | ✅ |
| Android | ✅ |

**Example**:

```tsx
import { useIsWiredHeadphonesConnected } from 'react-native-nitro-device-info';

function WiredAudioStatus() {
  const wiredConnected = useIsWiredHeadphonesConnected();

  return (
    <Icon
      name={wiredConnected ? 'headphones' : 'headphones-off'}
      color={wiredConnected ? 'green' : 'gray'}
    />
  );
}
```

---

### `useIsBluetoothHeadphonesConnected()`

Monitor Bluetooth headphone/audio device connection state.

```typescript
function useIsBluetoothHeadphonesConnected(): boolean
```

**Returns**: `true` if Bluetooth audio devices are connected, `false` otherwise.

**Platform Support**:
| Platform | Supported |
|----------|-----------|
| iOS | ✅ |
| Android | ✅ |

**Example**:

```tsx
import { useIsBluetoothHeadphonesConnected } from 'react-native-nitro-device-info';

function BluetoothAudioStatus() {
  const bluetoothConnected = useIsBluetoothHeadphonesConnected();

  return (
    <Icon
      name="bluetooth"
      color={bluetoothConnected ? 'blue' : 'gray'}
    />
  );
}
```

---

## Display Hooks

### `useBrightness()`

Monitor screen brightness changes (iOS only).

```typescript
function useBrightness(): number | null
```

**Returns**:
- **iOS**: Brightness level (0.0 to 1.0), or `null` during initial load
- **Android**: `-1` (not supported)

**Platform Support**:
| Platform | Supported | Notes |
|----------|-----------|-------|
| iOS | ✅ | Real-time brightness monitoring |
| Android | ❌ | Returns -1 |

**Example**:

```tsx
import { useBrightness } from 'react-native-nitro-device-info';
import { Platform } from 'react-native';

function BrightnessIndicator() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return <Text>Brightness monitoring is iOS only</Text>;
  }

  if (brightness === null) {
    return <Text>Loading...</Text>;
  }

  return <Text>Brightness: {Math.round(brightness * 100)}%</Text>;
}
```

---

## Platform Support Summary

| Hook | iOS | Android |
|------|-----|---------|
| `useBatteryLevel` | ✅ | ✅ |
| `useBatteryLevelIsLow` | ✅ | ✅ |
| `usePowerState` | ✅ | ✅ |
| `useIsHeadphonesConnected` | ✅ | ✅ |
| `useIsWiredHeadphonesConnected` | ✅ | ✅ |
| `useIsBluetoothHeadphonesConnected` | ✅ | ✅ |
| `useBrightness` | ✅ | ❌ (-1) |

---

## Best Practices

### Handle Loading States

```tsx
const batteryLevel = useBatteryLevel();

if (batteryLevel === null) {
  return <LoadingSpinner />;
}
```

### Memoize Dependent Components

```tsx
const BatteryIcon = React.memo(({ level }: { level: number }) => {
  return <Icon name={getBatteryIcon(level)} />;
});

function Parent() {
  const level = useBatteryLevel();
  return level !== null && <BatteryIcon level={level} />;
}
```

### Platform-Specific Handling

```tsx
import { Platform } from 'react-native';

function BrightnessControl() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return null; // Not supported on Android
  }

  return <BrightnessSlider value={brightness} />;
}
```

---

## Migration from react-native-device-info

These hooks are designed to be drop-in replacements:

```tsx
// Before (react-native-device-info)
import { useBatteryLevel } from 'react-native-device-info';

// After (react-native-nitro-device-info)
import { useBatteryLevel } from 'react-native-nitro-device-info';

// Usage remains identical
const batteryLevel = useBatteryLevel();
```

See the [Migration Guide](/api/migration) for more details.
