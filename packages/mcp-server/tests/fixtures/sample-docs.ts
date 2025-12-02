/**
 * Sample documentation content for testing
 *
 * This is a frozen snapshot of sample markdown documentation
 * for unit testing the documentation parser.
 */

export const SAMPLE_README_CONTENT = `
# react-native-nitro-device-info

Get device information for React Native using Nitro's zero-overhead JSI bindings.

## Installation

\`\`\`bash
npm install react-native-nitro-device-info react-native-nitro-modules
\`\`\`

## Quick Start

\`\`\`typescript
import { NitroModules } from 'react-native-nitro-modules';
import type { DeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo = NitroModules.createHybridObject<DeviceInfo>('DeviceInfo');

// Get battery level
const battery = deviceInfo.getBatteryLevel();
console.log(\`Battery: \${Math.round(battery * 100)}%\`);
\`\`\`

## Features

- Zero-overhead JSI bindings via Nitro
- 80+ device information APIs
- TypeScript support
- iOS and Android support
`;

export const SAMPLE_API_DOC_CONTENT = `
# Battery APIs

APIs for accessing battery and power state information.

## getBatteryLevel

Get the current battery level as a float between 0.0 and 1.0.

### Usage

\`\`\`typescript
const level = deviceInfo.getBatteryLevel();
console.log(\`Battery: \${Math.round(level * 100)}%\`);
\`\`\`

### Platform Support

| Platform | Support |
|----------|---------|
| iOS | ✅ |
| Android | ✅ |

## getPowerState

Get comprehensive power state including battery level, charging status, and low power mode.

### Usage

\`\`\`typescript
const state = deviceInfo.getPowerState();
console.log(state);
// { batteryLevel: 0.75, batteryState: 'charging', lowPowerMode: false }
\`\`\`

### Platform Support

| Platform | Support |
|----------|---------|
| iOS | ✅ |
| Android | ✅ |

Note: \`lowPowerMode\` is iOS-only and will be \`false\` on Android.
`;

export const SAMPLE_TROUBLESHOOTING_CONTENT = `
# Troubleshooting

Common issues and solutions for react-native-nitro-device-info.

## iOS Simulator Issues

### getIpAddress returns empty

On iOS Simulator, the IP address may return empty or localhost depending on network configuration.

**Solution**: Test on a physical device for accurate network information.

### getBrightness returns unexpected values

The brightness API only works on physical iOS devices.

**Solution**: Test brightness-related features on physical devices.

## Android Issues

### getIsAirplaneMode not working on iOS

This API only works on Android. On iOS, it always returns \`false\` due to privacy restrictions.

**Solution**: Use alternative methods on iOS if airplane mode detection is required.

### serialNumber returns "unknown"

On Android 8.0+, reading the serial number requires the READ_PHONE_STATE permission.

**Solution**: Add the permission to your AndroidManifest.xml and request it at runtime.
`;

/**
 * Expected chunk counts from sample content
 */
export const EXPECTED_README_CHUNKS = 4;
export const EXPECTED_API_DOC_CHUNKS = 5;
export const EXPECTED_TROUBLESHOOTING_CHUNKS = 5;
