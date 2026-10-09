# Why Nitro Module?

[Nitro Modules](https://nitro.margelo.com/) connects JavaScript to native code through JSI (JavaScript Interface). This library uses a Nitro HybridObject implemented in Swift and Kotlin.

## How a call reaches native code

1. `DeviceInfo.nitro.ts` declares the properties, methods, and return types.
2. Nitrogen generates the C++, Swift, and Kotlin bindings.
3. `DeviceInfoModule` creates its native HybridObject on first access.
4. A property read or method call reaches the native implementation through those bindings.

The native implementation determines whether a value is cached or queried from the operating system.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const model = DeviceInfoModule.model; // Synchronous property.
const battery = DeviceInfoModule.getBatteryLevel(); // Synchronous method.

async function readIpAddress() {
  return await DeviceInfoModule.getIpAddress(); // Promise-based method.
}
```

## Synchronous access and its limits

Synchronous getters let you read values without managing a Promise. This is useful for device metadata and one-time component rendering.

Synchronous work still runs on the calling thread. A getter can query the operating system or populate a cache. JSI does not guarantee that it completes within one millisecond.

Do not infer call behavior from a name or from another device-info library. Use the [API Reference](/api/) to check whether a member is a property, a synchronous method, or a Promise-based method.

## React hooks use polling

The supplied hooks read native getters at intervals and clear their timers on unmount. They do not subscribe to native device events.

For example, `useBatteryLevel()` polls every five seconds. It does not provide an immediate notification for each battery change. See the [React Hooks Guide](/guide/react-hooks) for all intervals.

## Migration uses a separate entry point

The root export uses properties such as `DeviceInfoModule.model`. The `/compat` export provides functions such as `DeviceInfo.getModel()`.

The compatibility layer targets `react-native-device-info` 15.x. Some methods return placeholders, and native platform behavior can differ. Review the [Migration Guide](/api/migration) before replacing imports.

## Measure in your app

Use the repository's [benchmark app](https://github.com/l2hyunwoo/react-native-nitro-device-info/tree/main/example/benchmark) to compare the calls your app needs.

Record the device, OS, library versions, build mode, and whether caches were warm. Measure both call latency and the effect on rendering. This documentation does not define latency guarantees or a measured speedup over other libraries.

## Next steps

- [Getting Started](/guide/getting-started): dependencies and native setup
- [Quick Start](/guide/quick-start): properties, methods, and React usage
- [API Reference](/api/): signatures and platform limitations
