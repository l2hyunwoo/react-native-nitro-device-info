# Benchmark App

Side-by-side performance comparison between react-native-nitro-device-info (Nitro) and react-native-device-info, benchmarking 26 methods with detailed timing statistics and speedup multipliers.

## Features

- **Side-by-Side Comparison**: Test both Nitro and react-native-device-info implementations simultaneously
- **26 Benchmark Methods**: Cover key synchronous and asynchronous operations
- **High-Precision Timing**: Microsecond accuracy using `performance.now()` with warmup iterations
- **Statistical Analysis**: Min, max, average times, standard deviation
- **Speedup Multipliers**: Displays how many times faster Nitro is (deviceInfoTime / nitroTime)
- **Significance Indicators**: Green highlights for ≥2x improvements
- **Pass/Fail Targets**:
  - Synchronous methods: <1ms
  - Asynchronous methods: <100ms
- **Marketing Catchphrase**: Auto-generated based on benchmark results
- **Visual Indicators**: Purple badges for SYNC methods, Orange for ASYNC
- **Error Handling**: Graceful degradation for failed benchmarks
- **Progress Tracking**: Real-time progress during benchmark execution

## Requirements

This benchmark app requires **react-native-device-info** as a peer dependency for comparison testing:

```bash
cd example/benchmark
yarn add react-native-device-info
cd ios && pod install  # iOS only
```

The app will display an error card with installation instructions if the dependency is missing.

## Benchmark Methodology

### Timing

1. **Warmup Phase**: 100 iterations to allow JS engine optimization (JIT compilation)
2. **Measurement Phase**: Configurable iterations (typically 100-1000 depending on operation cost)
3. **High Precision**: Uses `performance.now()` for sub-millisecond accuracy
4. **Statistics**: Calculates min, max, average, and standard deviation

### Method Categories

- **Synchronous Methods** (target: <1ms):
  - deviceId, brand, model, systemName, systemVersion
  - isTablet, hasNotch, isEmulator, isCameraPresent
  - androidId, serialNumber (Android only)

- **Asynchronous Methods** (target: <100ms):
  - getUniqueId, getManufacturer, getBatteryLevel
  - getTotalMemory, getUsedMemory, getFreeDiskStorage
  - getVersion, getBuildNumber, getBundleId
  - getIpAddress, getMacAddress, getCarrier
  - getApiLevel, getSupportedAbis (Android only)

### Speedup Calculation

```
Speedup Multiplier = deviceInfoTime / nitroTime
```

- **≥2.0x**: Significant improvement (green highlight)
- **1.5-2.0x**: Moderate improvement (blue)
- **1.0-1.5x**: Slight improvement (orange)
- **<1.0x**: Slower performance (red)

## Architecture

Component hierarchy:

```
BenchmarkScreen.tsx (main screen)
├── StatisticsPanel.tsx (aggregate metrics)
│   └── PerformanceMultiplier.tsx (speedup widgets)
└── ComparisonRow.tsx (per-method comparison)
    └── PerformanceMultiplier.tsx (speedup display)
```

Core benchmark logic:

```
utils/timer.ts          - High-precision timing with statistics
benchmarks/comparator.ts - Side-by-side comparison logic
config/benchmarkMethods.ts - Method configurations
```

## Running the App

### From Repository Root

```bash
yarn benchmark ios      # iOS
yarn benchmark android  # Android
```

### From Benchmark Directory

```bash
cd example/benchmark
yarn ios      # iOS
yarn android  # Android
```

## Usage

1. Launch the app on your device or simulator
2. Ensure react-native-device-info is installed (see Requirements)
3. Tap "Run Performance Comparison" to execute benchmarks
4. Wait for progress indicator to complete (26 methods × 2 libraries)
5. Review results:
   - **Statistics Panel**: Overall metrics and marketing catchphrase
   - **Comparisons**: Detailed per-method timings
   - **Green rows**: Significant improvements (≥2x faster)
   - **Blue badges**: Methods that passed target times
6. Check Platform and timestamp at bottom

## Interpreting Results

### Statistics Panel

- **Total/Successful**: Number of methods benchmarked
- **Avg/Max Speedup**: Overall and best-case performance gains
- **Significant Count**: Number of methods with ≥2x improvement
- **Pass Rates**: Percentage of methods meeting target times

### Comparison Rows

Each row shows:
- **Method Name**: Property or function being tested
- **Type Badge**: SYNC (purple) or ASYNC (orange)
- **Status Badge**: PASS (blue), FAIL (red), or ERROR (gray)
- **Nitro Time**: Average time for Nitro implementation
- **DeviceInfo Time**: Average time for react-native-device-info
- **Speedup**: Multiplier with significance indicator

## Development

The benchmark app serves multiple purposes:

- **Performance Validation**: Verify Nitro's zero-overhead JSI claims
- **Regression Testing**: Detect performance regressions in updates
- **Marketing Data**: Generate comparative performance metrics
- **Platform Comparison**: Test iOS vs Android performance characteristics

## Troubleshooting

### Dependency Error

If you see "react-native-device-info is not properly installed":

1. Install the dependency: `cd example/benchmark && yarn add react-native-device-info`
2. Link native modules: `cd ios && pod install` (iOS only)
3. Clean and rebuild: `yarn benchmark ios --reset-cache` or `yarn benchmark android`

### Inconsistent Results

- Run on physical devices for accurate timing (simulators may show JIT artifacts)
- Close background apps to minimize system load
- Run benchmarks multiple times and average results
- Warmup phase should stabilize JIT compilation
