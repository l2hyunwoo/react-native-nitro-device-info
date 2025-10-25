# Nitro Device Info Showcase App

A simple, single-screen demonstration app for the react-native-nitro-device-info library.

## Purpose

This app demonstrates:
- All available device information properties
- Usage examples of synchronous and asynchronous methods
- Integration of the react-native-nitro-device-info library
- Clean, straightforward implementation without navigation complexity

## Running the Showcase App

### iOS

```bash
# From repository root
yarn showcase ios
```

Or from the showcase directory:

```bash
cd example/showcase
yarn ios
```

### Android

```bash
# From repository root
yarn showcase android
```

Or from the showcase directory:

```bash
cd example/showcase
yarn android
```

## Metro Configuration

The showcase app uses the default Metro port (8081).

## Features

- Simple single-screen interface displaying all device information
- No navigation dependencies (React Navigation removed for simplicity)
- Direct SafeAreaView implementation using react-native-safe-area-context
- Comprehensive display of:
  - Device identification
  - System information
  - Hardware capabilities
  - Battery status
  - Network information
  - Application metadata

## Development

### Installing Dependencies

```bash
cd example/showcase
yarn install
```

### iOS Pod Install

```bash
cd example/showcase/ios
pod install
```

## Build Configuration

- **Bundle ID (iOS)**: nitrodeviceinfo.example
- **Package Name (Android)**: com.nitrodeviceinfoexample
- **Display Name**: NitroDeviceInfoExample
- **Metro Port**: 8081 (default)

## Comparison with Benchmark App

| Feature | Showcase App | Benchmark App |
|---------|-------------|---------------|
| Purpose | Demo/Examples | Performance Testing |
| Complexity | Simple | Complex |
| Metro Port | 8081 | 8082 |
| Navigation | None | None |
| Independence | ✓ | ✓ |
