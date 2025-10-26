# Introduction

Welcome to `react-native-nitro-device-info` - a high-performance device information library for React Native, built on [Nitro Modules](https://nitro.margelo.com/) for zero-overhead native access through JSI.

## What is `react-native-nitro-device-info`?

`react-native-nitro-device-info` provides comprehensive device information and system metrics for React Native applications. Unlike traditional libraries that use the React Native bridge, this library leverages Nitro Modules to communicate directly with native code, delivering instant synchronous access to device information.

## Key Features

### 📱 100+ Device Properties

Access comprehensive device information:
- Device identification (model, brand, manufacturer)
- System information (OS version, API level)
- Hardware capabilities (memory, storage, battery)
- Network and connectivity details
- Application metadata

### ⚡ Instant Synchronous Access

Most methods return results immediately (<1ms) with no async overhead. Only I/O-bound operations like network queries remain asynchronous.

### 📦 TypeScript-first

Full type definitions included out of the box. All APIs are fully typed with comprehensive IntelliSense support.

### 🌐 Cross-platform Support

Works seamlessly on:
- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)

### 🔄 Easy Migration

100% API compatible with `react-native-device-info` for seamless transition from existing projects.

## Why Choose This Library?

`react-native-nitro-device-info` is the ideal choice when you need:

- **Best-in-class performance**: Synchronous APIs with <1ms latency
- **Modern architecture**: Built on React Native's New Architecture
- **Type safety**: Complete TypeScript definitions with IntelliSense
- **Hassle-free migration**: Familiar API if coming from `react-native-device-info`
- **Future-proof**: Built with the latest Nitro Modules technology

## Quick Example

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Synchronous properties (immediate - <1ms)
console.log(DeviceInfoModule.deviceId);      // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand);         // "Apple"

// Synchronous methods (immediate - <1ms)
const uniqueId = DeviceInfoModule.getUniqueId();
const isTablet = DeviceInfoModule.isTablet();
const batteryLevel = DeviceInfoModule.getBatteryLevel();

// Asynchronous methods (Promise-based - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
```

## Next Steps

- Learn [Why Nitro Module](/guide/why-nitro-module) was chosen for this library
- Follow the [Getting Started](/guide/getting-started) guide to install
- Check out the [Quick Start](/guide/quick-start) examples
- Explore the complete [API Reference](/api/)
