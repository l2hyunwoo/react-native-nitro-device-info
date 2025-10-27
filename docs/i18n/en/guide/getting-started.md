# Getting Started

This guide will help you install and configure `react-native-nitro-device-info` in your React Native project.

## Prerequisites

Before installing, ensure your project meets these requirements:

- **React Native**: 0.68 or higher (New Architecture support)
- **iOS**: Deployment target 13.4 or higher
- **Android**: minSdkVersion 24 or higher (Android 7.0 Nougat)
- **Node.js**: 16 or higher

## Installation

Install the library and its peer dependency using your preferred package manager:

```bash
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **Important**: `react-native-nitro-modules` ^0.31.0 is required as a peer dependency for JSI bindings.

## Platform Setup

### iOS Configuration

After installation, install the CocoaPods dependencies:

```sh
cd ios && pod install && cd ..
```

That's it! The iOS setup is complete.

### Android Configuration

No additional configuration needed! Gradle auto-linking handles everything automatically.

The library will be automatically linked when you build your Android app.

## Verify Installation

To verify the installation was successful, add this code to your app:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

console.log('Device ID:', DeviceInfoModule.deviceId);
console.log('Brand:', DeviceInfoModule.brand);
console.log('System Version:', DeviceInfoModule.systemVersion);
```

If you see device information logged to the console, the installation was successful!

## Next Steps

Now that you have the library installed, check out the [Quick Start](/guide/quick-start) guide to learn how to use it in your app.

You can also:
- Explore the [API Reference](/api/) for all available methods
- View [Examples](/examples/basic-usage) for common use cases
- Check out the [Migration Guide](/api/migration) if coming from `react-native-device-info`
