# Nitro Device Info Benchmark App

Performance testing application for the react-native-nitro-device-info library.

## Purpose

This app is designed to:
- Benchmark performance of Nitro module device info retrieval
- Compare with alternative implementations
- Measure execution time and memory usage
- Stress test the Nitro module under various conditions

## Running the Benchmark App

### iOS

```bash
# From repository root
yarn benchmark ios
```

Or from the benchmark directory:

```bash
cd example/benchmark
yarn ios
```

### Android

```bash
# From repository root
yarn benchmark android
```

Or from the benchmark directory:

```bash
cd example/benchmark
yarn android
```

## Metro Configuration

The benchmark app runs on Metro port 8082 to allow running simultaneously with the showcase app (which uses the default port 8081).

## Development

The benchmark app is completely independent of the showcase app. Changes to one will not affect the other.

### Installing Dependencies

```bash
cd example/benchmark
yarn install
```

### iOS Pod Install

```bash
cd example/benchmark/ios
pod install
```

## Build Configuration

- **Bundle ID (iOS)**: com.nitrodeviceinfobenchmark
- **Package Name (Android)**: com.nitrodeviceinfobenchmark
- **Display Name**: Nitro Device Info Benchmark
- **Metro Port**: 8082
