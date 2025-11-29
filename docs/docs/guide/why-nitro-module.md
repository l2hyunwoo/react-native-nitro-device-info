# Why Nitro Module?

`react-native-nitro-device-info` is built on [Nitro Modules](https://nitro.margelo.com/), representing a significant architectural advancement for React Native libraries. This page explains the technical benefits and why we chose Nitro Modules over traditional approaches.

## The Evolution of React Native Architecture

### Traditional Bridge-Based Approach

Historically, React Native libraries communicated between JavaScript and native code through the **React Native Bridge**:

1. JavaScript calls a native method
2. Data is serialized to JSON
3. Message crosses the bridge asynchronously
4. Native code deserializes JSON and executes
5. Results serialize back to JSON
6. Response crosses the bridge again
7. JavaScript receives and deserializes the result

**Problems**:
- High serialization/deserialization overhead
- Asynchronous by default (even for simple getters)
- Performance bottlenecks for frequent calls
- Large data structures are expensive to transfer

### Modern JSI-Based Approach

Nitro Modules use **JSI (JavaScript Interface)** for direct communication:

1. JavaScript calls a native method
2. JSI invokes native code directly (C++ bridge)
3. Native code executes immediately
4. Results return directly through JSI
5. JavaScript receives the result synchronously

**Benefits**:
- Near-zero overhead (direct C++ calls)
- Synchronous APIs when appropriate
- No JSON serialization costs
- Minimal latency (<1ms for most calls)

## Architecture Comparison

### Event-Based (Old Architecture)

Libraries like `@react-native-community/geolocation` use an event-based system:

- Callbacks stored only in JavaScript
- Native code emits updates through the Bridge
- Events dispatched via EventEmitter
- All listeners share a single event stream
- JSON serialization for every update

**Use when**: Supporting older React Native versions (< 0.68) or prioritizing stability.

### Direct Callback (Nitro Modules)

React Native Nitro Device Info uses direct JSI function references:

- Callbacks passed directly to native code
- Each operation maintains its own callback
- Minimal serialization (C++ structs → JS objects)
- Native code invokes callbacks without Bridge
- Direct function calls through JSI

**Use when**: Building performance-critical apps, using New Architecture, or requiring compile-time type safety.

## JSI Technical Foundation

### How Nitro Modules Work

1. **Nitrogen Code Generation**
   - Define interface in TypeScript
   - Nitrogen generates C++ JSI bindings
   - Bridges Kotlin/Swift implementations with JSI

2. **HybridObject System**
   - Native code holds direct references to JS functions
   - Immediate callback invocation
   - Type-safe communication layer

3. **Compile-Time Type Safety**
   - Full TypeScript definitions
   - Generated native type mappings
   - Errors caught at build time

### Performance Characteristics

| Operation | Bridge-Based | Nitro Module |
|-----------|--------------|--------------|
| Simple getter | ~5-10ms (async) | <1ms (sync) |
| Method call | ~5-15ms | <1ms |
| Data transfer | Linear with size | Minimal overhead |
| Callback overhead | High (serialization) | Near-zero (direct) |

## Why We Chose Nitro Modules

### 1. Zero-Overhead Native Access

Device information queries are frequent operations that benefit immensely from synchronous, direct access:

```typescript
// Old approach (react-native-device-info)
const brand = await DeviceInfo.getBrand(); // ~5-10ms, async required
const model = await DeviceInfo.getModel(); // Another 5-10ms

// Nitro approach
const brand = DeviceInfoModule.brand;      // <1ms, direct property
const model = DeviceInfoModule.model;      // <1ms, direct property
```

### 2. Synchronous APIs Where Appropriate

Most device information is instantly available from system APIs:

```typescript
// Everything synchronous except I/O-bound operations
const deviceId = DeviceInfoModule.deviceId;     // Sync
const totalMemory = DeviceInfoModule.totalMemory; // Sync
const isTablet = DeviceInfoModule.isTablet;     // Sync

// Only network/async operations remain async
const ipAddress = await DeviceInfoModule.getIpAddress(); // Async (I/O)
```

### 3. Type Safety and Developer Experience

Nitrogen generates complete type definitions from the source specification:

```typescript
import type { DeviceInfo, PowerState, BatteryState } from 'react-native-nitro-device-info';

// Full IntelliSense support
const powerState: PowerState = DeviceInfoModule.getPowerState();
// TypeScript knows all properties: lowPowerMode, batteryLevel, batteryState
```

### 4. Future-Proof Architecture

Nitro Modules align with React Native's **New Architecture**:

- Built for the Fabric renderer
- Designed for TurboModules compatibility
- Supports Concurrent React features
- Long-term support from Meta and the community

### 5. 100% API Compatibility

We maintain compatibility with `react-native-device-info` while delivering superior performance:

```typescript
// Migration is straightforward
// Before: const deviceId = DeviceInfo.getDeviceId();
// After:  const deviceId = DeviceInfoModule.deviceId;
```

Most APIs remain identical, with the main difference being synchronous access for instant queries.

## When to Choose Each Approach

### Choose Bridge-Based Libraries When:

- Supporting React Native < 0.68
- Team unfamiliar with JSI/New Architecture
- Prioritizing ecosystem stability over performance
- Building apps with minimal device info queries

### Choose Nitro Module Libraries When:

- Building performance-critical applications
- Using React Native New Architecture (0.68+)
- Requiring real-time device information
- Need compile-time type safety
- Want forward-looking, modern architecture

## Real-World Impact

### Example: Battery Monitoring Dashboard

An app querying battery status every second:

**Bridge-based**:
- 1,000 calls/minute
- ~5ms per call = 5 seconds overhead/minute
- Async handling complexity
- UI jank from async updates

**Nitro Module**:
- 1,000 calls/minute
- <1ms per call = <1 second overhead/minute
- Synchronous, immediate updates
- Smooth UI performance

## Learn More

- [Nitro Modules Official Documentation](https://nitro.margelo.com/)
- [React Native New Architecture](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [JSI Deep Dive](https://reactnative.dev/architecture/fabric-renderer#javascript-interfaces-jsi)

## Next Steps

Now that you understand why Nitro Modules power this library, let's get started:

- [Getting Started](/guide/getting-started) - Installation guide
- [Quick Start](/guide/quick-start) - Code examples
- [API Reference](/api/) - Complete API documentation
