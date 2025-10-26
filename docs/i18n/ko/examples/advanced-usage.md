# 고급 사용법

`react-native-nitro-device-info`의 고급 사용 패턴 및 최적화 기법입니다.

## 기기 지문

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 고유 기기 식별자 생성
function generateDeviceFingerprint() {
  return {
    uniqueId: DeviceInfoModule.getUniqueId(),
    brand: DeviceInfoModule.brand,
    model: DeviceInfoModule.model,
    systemVersion: DeviceInfoModule.systemVersion,
  };
}
```

## 성능 모니터링

```typescript
// 메모리 사용량 추적
function trackMemoryUsage() {
  const total = DeviceInfoModule.getTotalMemory();
  const used = DeviceInfoModule.getUsedMemory();
  const percentage = (used / total) * 100;

  return { total, used, percentage };
}
```

## 네트워크 정보

```typescript
// 비동기 네트워크 정보 수집
async function getNetworkInfo() {
  const [ipAddress, carrier] = await Promise.all([
    DeviceInfoModule.getIpAddress(),
    DeviceInfoModule.getCarrier(),
  ]);

  return { ipAddress, carrier };
}
```

## 플랫폼별 로직

```typescript
// iOS vs Android 처리
const deviceId = DeviceInfoModule.deviceId;

if (DeviceInfoModule.brand === 'Apple') {
  // iOS 특정 로직
} else {
  // Android 특정 로직
}
```

## 더 알아보기

전체 API 목록은 [API 레퍼런스](/api/)를 참조하세요.
