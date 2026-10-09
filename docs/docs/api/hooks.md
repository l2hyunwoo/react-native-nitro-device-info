# React Hooks

React hooks for monitoring runtime device properties. They poll native getters and re-render when a sampled value changes. See [update intervals and initial values](/guide/react-hooks#update-intervals-and-initial-values).

All seven hooks were introduced in v1.4.0. Native minimums are iOS 15.1 and Android API 24. Web requires v1.8.0 or later. See [availability badges](/api/#availability-badges).

This page documents root exports. Headphone hooks from `/compat` return `{ loading, result }` instead of `boolean`.

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Read battery level after mount and poll every five seconds.

```typescript
function useBatteryLevel(): number | null
```

**Returns**: Battery level (0.0 to 1.0), or `null` during initial load or when unavailable.

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Monitor for low battery conditions with platform-specific thresholds.

```typescript
function useBatteryLevelIsLow(): number | null
```

**Returns**: Battery level when below threshold, or `null` if battery is not low or unavailable. An unavailable reading does not trigger a low-battery warning.

**Thresholds**:
- **iOS**: 20% (matches iOS low power mode trigger)
- **Android**: 15% (matches Android low battery warning)

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: limited</span> <span class="rp-badge rp-badge--warning">Web: limited</span>

Monitor comprehensive power state including battery level, charging status, and low power mode.

```typescript
function usePowerState(): Partial<PowerState>
```

On Android, `lowPowerMode` is always `false`.

**Returns**: A `Partial<PowerState>` object. All properties are optional and may be `undefined` during initial load or if unavailable on the platform:
- `batteryLevel?: number` - Battery charge level (0.0 to 1.0), or `-1` when unavailable
- `batteryState?: BatteryState` - Charging status ('unknown', 'unplugged', 'charging', 'full')
- `lowPowerMode?: boolean` - Whether low power mode is enabled (iOS only)

**Example**:

```tsx
import { usePowerState } from 'react-native-nitro-device-info';

function PowerStatus() {
  const powerState = usePowerState();
  const level = powerState.batteryLevel;

  return (
    <View>
      <Text>Level: {level === undefined || level < 0
        ? 'Loading or unavailable'
        : Math.round(level * 100) + '%'}</Text>
      <Text>Status: {powerState.batteryState ?? 'unknown'}</Text>
      <Text>Low Power: {powerState.lowPowerMode ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

---

## Headphone Hooks

### `useIsHeadphonesConnected()`

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Monitor headphone connection state (wired or Bluetooth).

```typescript
function useIsHeadphonesConnected(): boolean
```

**Returns**: `true` if any headphones are connected, `false` otherwise.

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Monitor wired headphone connection state.

```typescript
function useIsWiredHeadphonesConnected(): boolean
```

**Returns**: `true` if wired headphones are connected, `false` otherwise.

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Monitor Bluetooth headphone/audio device connection state.

```typescript
function useIsBluetoothHeadphonesConnected(): boolean
```

**Returns**: `true` if Bluetooth audio devices are connected, `false` otherwise.

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

<span class="rp-badge rp-badge--tip">Since v1.4.0</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback</span> <span class="rp-badge rp-badge--warning">Web: fallback</span>

Monitor screen brightness changes (iOS only).

```typescript
function useBrightness(): number | null
```

**Returns**:
- **iOS**: Brightness level (0.0 to 1.0), or `null` during initial load
- **Android**: `-1` (not supported)

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

For migration that preserves `react-native-device-info` hook result shapes, use `/compat`:

```tsx
// Before (react-native-device-info)
import { useBatteryLevel } from 'react-native-device-info';

// After (compatibility entry point)
import { useBatteryLevel } from 'react-native-nitro-device-info/compat';

// Usage remains identical
const batteryLevel = useBatteryLevel();
```

See the [Migration Guide](/api/migration) for more details.
