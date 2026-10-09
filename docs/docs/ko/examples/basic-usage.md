---
translationOf: examples/basic-usage.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 기본 사용 예제 {#basic-usage-examples}

실제 예제로 `react-native-nitro-device-info` 사용법을 설명합니다.

## 시작하기 {#getting-started}

컴포넌트에서 모듈을 가져오세요.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

## 간단한 기기 정보 {#simple-device-information}

### 기기 속성 읽기 {#accessing-device-properties}

속성에 직접 접근하면 간단하게 기기 정보를 읽을 수 있습니다.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function showDeviceInfo() {
  console.log('Device ID:', DeviceInfoModule.deviceId);
  console.log('Brand:', DeviceInfoModule.brand);
  console.log('Model:', DeviceInfoModule.model);
  console.log('OS:', DeviceInfoModule.systemName);
  console.log('OS Version:', DeviceInfoModule.systemVersion);
}

showDeviceInfo();
// Output:
// Device ID: iPhone14,2
// Brand: Apple
// Model: iPhone 13 Pro
// OS: iOS
// OS Version: 15.0
```

### 기본 React 컴포넌트 {#basic-react-component}

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function DeviceInfoCard() {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Device Information</Text>
      <Text>Brand: {DeviceInfoModule.brand}</Text>
      <Text>Model: {DeviceInfoModule.model}</Text>
      <Text>Device ID: {DeviceInfoModule.deviceId}</Text>
      <Text>OS: {DeviceInfoModule.systemName} {DeviceInfoModule.systemVersion}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
```

## 기기 기능 {#device-capabilities}

### 기기 유형 확인 {#check-device-type}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getDeviceCategory(): string {
  if (DeviceInfoModule.isTablet) {
    return 'This is a tablet';
  } else {
    return 'This is a phone';
  }
}

console.log(getDeviceCategory());
```

### 특정 기능 확인 {#check-for-specific-features}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Check if device has a notch
if (DeviceInfoModule.getHasNotch()) {
  console.log('Device has a notch - adjust UI accordingly');
}

// Check if device has Dynamic Island (iPhone 14 Pro+)
if (DeviceInfoModule.getHasDynamicIsland()) {
  console.log('Device has Dynamic Island');
}

// Check if camera is available
if (DeviceInfoModule.isCameraPresent) {
  console.log('Camera is available');
}

// Check if running in simulator/emulator
if (DeviceInfoModule.isEmulator) {
  console.log('Running in simulator/emulator');
}
```

## 배터리 정보 {#battery-information}

### 간단한 배터리 표시 {#simple-battery-display}

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function BatteryIndicator() {
  const batteryLevel = DeviceInfoModule.getBatteryLevel();
  const isCharging = DeviceInfoModule.getIsBatteryCharging();

  const percentage = (batteryLevel * 100).toFixed(0);

  return (
    <View>
      <Text>Battery: {percentage}%</Text>
      {isCharging && <Text>⚡ Charging</Text>}
    </View>
  );
}
```

### 배터리 잔량 경고 {#battery-level-warning}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function checkBatteryStatus() {
  const batteryLevel = DeviceInfoModule.getBatteryLevel();

  if (DeviceInfoModule.isLowBatteryLevel(0.2)) {
    console.warn(`Battery low: ${(batteryLevel * 100).toFixed(0)}%`);
    return 'low';
  } else if (DeviceInfoModule.isLowBatteryLevel(0.5)) {
    console.log(`Battery moderate: ${(batteryLevel * 100).toFixed(0)}%`);
    return 'moderate';
  } else {
    console.log(`Battery good: ${(batteryLevel * 100).toFixed(0)}%`);
    return 'good';
  }
}
```

### 전체 전원 상태 {#complete-power-state}

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState } from 'react-native-nitro-device-info';

export default function PowerStateDisplay() {
  const powerState: PowerState = DeviceInfoModule.getPowerState();

  const percentage = (powerState.batteryLevel * 100).toFixed(0);

  return (
    <View>
      <Text>Battery: {percentage}%</Text>
      <Text>Status: {powerState.batteryState}</Text>
      {powerState.lowPowerMode && <Text>🔋 Low Power Mode</Text>}
    </View>
  );
}
```

## 시스템 리소스 {#system-resources}

### 메모리 사용량 표시 {#memory-usage-display}

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function MemoryInfo() {
  const totalMemory = DeviceInfoModule.totalMemory;
  const usedMemory = DeviceInfoModule.getUsedMemory();

  const totalGB = (totalMemory / 1024 / 1024 / 1024).toFixed(1);
  const usedMB = (usedMemory / 1024 / 1024).toFixed(0);

  return (
    <View>
      <Text>Total RAM: {totalGB} GB</Text>
      <Text>App Memory Usage: {usedMB} MB</Text>
    </View>
  );
}
```

### 저장 공간 정보 {#storage-information}

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function StorageInfo() {
  const totalDisk = DeviceInfoModule.totalDiskCapacity;
  const freeDisk = DeviceInfoModule.getFreeDiskStorage();

  const totalGB = (totalDisk / 1024 / 1024 / 1024).toFixed(0);
  const freeGB = (freeDisk / 1024 / 1024 / 1024).toFixed(1);

  return (
    <View>
      <Text>Total Storage: {totalGB} GB</Text>
      <Text>Free Space: {freeGB} GB</Text>
    </View>
  );
}
```

## 앱 정보 {#application-information}

### 앱 버전 표시 {#app-version-display}

```typescript
import React from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function AppVersionInfo() {
  const appName = DeviceInfoModule.applicationName;
  const version = DeviceInfoModule.version;
  const buildNumber = DeviceInfoModule.buildNumber;
  const bundleId = DeviceInfoModule.bundleId;

  return (
    <View>
      <Text>{appName}</Text>
      <Text>Version: {version}</Text>
      <Text>Build: {buildNumber}</Text>
      <Text>Bundle ID: {bundleId}</Text>
    </View>
  );
}
```

### 읽기 쉬운 버전 문자열 {#readable-version-string}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Get formatted version string
const version = DeviceInfoModule.readableVersion;
console.log(`App version: ${version}`); // "1.2.3.42"
```

## 네트워크 정보(비동기) {#network-information-async}

### IP 주소 읽기 {#get-ip-address}

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function NetworkInfo() {
  const [ipAddress, setIpAddress] = useState<string>('Loading...');

  useEffect(() => {
    DeviceInfoModule.getIpAddress()
      .then(setIpAddress)
      .catch(() => setIpAddress('Unavailable'));
  }, []);

  return (
    <View>
      <Text>IP Address: {ipAddress}</Text>
    </View>
  );
}
```

### 통신사 정보 읽기 {#get-carrier-information}

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function CarrierInfo() {
  const [carrier, setCarrier] = useState<string>('Loading...');

  useEffect(() => {
    DeviceInfoModule.getCarrier()
      .then(setCarrier)
      .catch(() => setCarrier('No SIM'));
  }, []);

  return (
    <View>
      <Text>Carrier: {carrier}</Text>
    </View>
  );
}
```

### 여러 비동기 호출 {#multiple-async-calls}

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

type NetworkState = {
  ipAddress: string;
  carrier: string;
  locationEnabled: boolean;
};

export default function CompleteNetworkInfo() {
  const [networkState, setNetworkState] = useState<NetworkState>({
    ipAddress: 'Loading...',
    carrier: 'Loading...',
    locationEnabled: false,
  });

  useEffect(() => {
    // Fetch all network info in parallel
    Promise.all([
      DeviceInfoModule.getIpAddress(),
      DeviceInfoModule.getCarrier(),
      DeviceInfoModule.isLocationEnabled(),
    ])
      .then(([ip, carrier, location]) => {
        setNetworkState({
          ipAddress: ip,
          carrier: carrier,
          locationEnabled: location,
        });
      })
      .catch(error => {
        console.error('Failed to fetch network info:', error);
      });
  }, []);

  return (
    <View>
      <Text>IP: {networkState.ipAddress}</Text>
      <Text>Carrier: {networkState.carrier}</Text>
      <Text>Location: {networkState.locationEnabled ? 'Enabled' : 'Disabled'}</Text>
    </View>
  );
}
```

## 전체 예제 앱 {#complete-example-app}

여러 기능을 함께 사용하는 전체 예제입니다.

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function DeviceInfoScreen() {
  const [ipAddress, setIpAddress] = useState<string>('Loading...');

  // Synchronous data - instant access
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const model = DeviceInfoModule.model;
  const systemVersion = DeviceInfoModule.systemVersion;
  const isTablet = DeviceInfoModule.isTablet;
  const batteryLevel = DeviceInfoModule.getBatteryLevel();
  const totalMemory = DeviceInfoModule.totalMemory;
  const freeDisk = DeviceInfoModule.getFreeDiskStorage();

  // Async data - fetch on mount
  useEffect(() => {
    DeviceInfoModule.getIpAddress()
      .then(setIpAddress)
      .catch(() => setIpAddress('Unavailable'));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Information</Text>
        <Text>Brand: {brand}</Text>
        <Text>Model: {model}</Text>
        <Text>Device ID: {deviceId}</Text>
        <Text>OS Version: {systemVersion}</Text>
        <Text>Type: {isTablet ? 'Tablet' : 'Phone'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Status</Text>
        <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
        <Text>RAM: {(totalMemory / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
        <Text>Free Storage: {(freeDisk / 1024 / 1024 / 1024).toFixed(1)} GB</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Network</Text>
        <Text>IP Address: {ipAddress}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
});
```

## 다음 단계 {#next-steps}

- [고급 사용법](/examples/advanced-usage): 복잡한 사용 패턴
- [React 훅](/guide/react-hooks): 상태 변화 관찰
- [API 레퍼런스](/api/device-info): 사용 가능한 전체 메서드
- [타입 정의](/api/types): TypeScript 지원
