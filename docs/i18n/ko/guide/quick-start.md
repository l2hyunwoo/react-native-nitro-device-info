# 빠른 시작

이 가이드는 `react-native-nitro-device-info`를 사용하여 앱에서 기기 정보에 액세스하는 방법을 보여줍니다.

## 기본 사용법

라이브러리를 설치한 후 기기 정보에 액세스하는 것은 간단합니다:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 동기 속성 액세스 (즉시)
const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const systemVersion = DeviceInfoModule.systemVersion;

console.log(`기기: ${brand} ${model}`);
console.log(`OS 버전: ${systemVersion}`);
```

## 일반적인 사용 사례

### 기기 식별

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 기본 기기 정보
const deviceInfo = {
  id: DeviceInfoModule.deviceId,
  brand: DeviceInfoModule.brand,
  model: DeviceInfoModule.model,
  uniqueId: DeviceInfoModule.getUniqueId(),
};

console.log('기기 정보:', deviceInfo);
```

### 시스템 정보

```typescript
// OS 및 앱 정보
const systemInfo = {
  systemVersion: DeviceInfoModule.systemVersion,
  apiLevel: DeviceInfoModule.apiLevel,
  appVersion: DeviceInfoModule.appVersion,
  buildNumber: DeviceInfoModule.buildNumber,
};

console.log('시스템 정보:', systemInfo);
```

### 하드웨어 기능

```typescript
// 메모리 및 스토리지
const totalMemory = DeviceInfoModule.getTotalMemory();
const usedMemory = DeviceInfoModule.getUsedMemory();
const isTablet = DeviceInfoModule.isTablet();

console.log(`총 메모리: ${totalMemory} bytes`);
console.log(`사용된 메모리: ${usedMemory} bytes`);
console.log(`태블릿 여부: ${isTablet}`);
```

### 배터리 정보

```typescript
// 배터리 상태
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const powerState = DeviceInfoModule.getPowerState();

console.log(`배터리 레벨: ${batteryLevel}%`);
console.log('전원 상태:', powerState);
```

### 비동기 작업

일부 작업(예: 네트워크 쿼리)은 비동기입니다:

```typescript
// IP 주소 가져오기 (비동기)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log('IP 주소:', ipAddress);

// 통신사 정보 가져오기 (비동기)
const carrier = await DeviceInfoModule.getCarrier();
console.log('통신사:', carrier);
```

## React 컴포넌트 통합

다음은 React Native 컴포넌트에서 라이브러리를 사용하는 방법입니다:

```typescript
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

export default function DeviceInfoScreen() {
  const [ipAddress, setIpAddress] = useState<string>('');

  useEffect(() => {
    // 비동기 데이터 로드
    DeviceInfoModule.getIpAddress().then(setIpAddress);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>기기 정보</Text>
      <Text>브랜드: {DeviceInfoModule.brand}</Text>
      <Text>모델: {DeviceInfoModule.model}</Text>
      <Text>OS: {DeviceInfoModule.systemVersion}</Text>
      <Text>IP: {ipAddress}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10 },
});
```

## 다음 단계

- 전체 메서드 목록은 [API 레퍼런스](/api/)를 확인하세요
- 더 많은 패턴은 [고급 사용법](/examples/advanced-usage)을 살펴보세요
- `react-native-device-info`에서 마이그레이션하는 경우 [마이그레이션 가이드](/api/migration)를 확인하세요
