# Quick Start

Complete [Getting Started](/guide/getting-started) or [Expo Setup](/guide/expo-setup) and rebuild your native app first.

This page uses the native API from the package root. For `react-native-device-info`-style functions, use the [`/compat` entry point](/api/migration).

## Read a property, call a method, await a Promise

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Properties: no parentheses and no await.
const model = DeviceInfoModule.model;
const isTablet = DeviceInfoModule.isTablet;

// Synchronous methods: parentheses, no await.
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const hasGms = DeviceInfoModule.getHasGms();

// Promise-based methods: await inside an async function.
async function readNetworkInfo() {
  try {
    const [ipAddress, carrier] = await Promise.all([
      DeviceInfoModule.getIpAddress(),
      DeviceInfoModule.getCarrier(),
    ]);
    console.log({ ipAddress, carrier });
  } catch (error) {
    console.error('Could not read network information', error);
  }
}

console.log({ model, isTablet, hasGms });
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${Math.round(batteryLevel * 100)}%`);
void readNetworkInfo();
```

`getBatteryLevel()` returns `-1` when unavailable. `getHasGms()` returns `false` on iOS. Promise return types do not specify a completion deadline.

## Display changing values in React

A direct getter reads a snapshot. Use a hook when the component must update as the value changes.

```tsx
import { Text, View } from 'react-native';
import {
  DeviceInfoModule,
  useBatteryLevel,
} from 'react-native-nitro-device-info';

export default function DeviceInfoScreen() {
  const batteryLevel = useBatteryLevel();

  return (
    <View>
      <Text>Model: {DeviceInfoModule.model}</Text>
      <Text>OS: {DeviceInfoModule.systemVersion}</Text>
      <Text>Battery: {batteryLevel === null
        ? 'Loading or unavailable'
        : `${Math.round(batteryLevel * 100)}%`}</Text>
    </View>
  );
}
```

`useBatteryLevel()` reads after mount and polls every five seconds. It returns `null` before the first reading or when the battery level is unavailable. See [React Hooks](/guide/react-hooks) for update intervals and other return types.

## Check units and unsupported values

| Value | Unit or meaning | Check before use |
| --- | --- | --- |
| `totalMemory`, `getUsedMemory()` | Bytes; device RAM and current app memory respectively | Availability depends on the platform |
| `getBatteryLevel()` | Fraction from `0` to `1` | `-1` means unavailable |
| `getBrightness()` | Fraction from `0` to `1` on iOS | `-1` on Android |
| `apiLevel` | Android API level | `-1` on iOS |
| `uniqueId` | iOS IDFV or Android ANDROID_ID | Can change; do not treat it as an account or permanent device identity |

See [DeviceInfo Module](/api/device-info) for exact signatures, caching, permissions, and platform behavior. Web uses [fallback values](/guide/web-support).

## Next steps

- [Basic Usage](/examples/basic-usage): examples grouped by task
- [API Reference](/api/): find properties, methods, hooks, and types
- [Migration Guide](/api/migration): choose compatibility or native APIs
