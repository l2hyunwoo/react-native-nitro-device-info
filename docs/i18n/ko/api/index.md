# API 레퍼런스

`react-native-nitro-device-info`는 React Native 애플리케이션의 기기 정보에 액세스하기 위한 포괄적인 API를 제공합니다.

## 모듈 가져오기

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

## API 카테고리

### [기기 정보 모듈](/api/device-info)

기기 식별, 시스템 정보, 하드웨어 기능, 배터리 상태 등을 포함한 기본 API 모듈입니다.

주요 카테고리:
- **기기 식별**: deviceId, brand, model, manufacturer 등
- **시스템 정보**: systemVersion, apiLevel, buildNumber 등
- **하드웨어**: totalMemory, isTablet, hasNotch 등
- **배터리**: batteryLevel, powerState 등
- **네트워크**: ipAddress, carrier (비동기)
- **애플리케이션**: appVersion, bundleId 등

### [타입 정의](/api/types)

라이브러리에서 사용되는 모든 TypeScript 타입 정의입니다.

### [마이그레이션 가이드](/api/migration)

`react-native-device-info`에서 마이그레이션하기 위한 가이드입니다.

## 빠른 레퍼런스

### 동기 API

대부분의 메서드는 즉시(<1ms) 동기적으로 값을 반환합니다:

```typescript
const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfoModule.brand;
const isTablet = DeviceInfoModule.isTablet();
```

### 비동기 API

네트워크 쿼리와 같은 I/O 바운드 작업은 비동기입니다:

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
```

## 다음으로

- 전체 메서드 목록은 [DeviceInfo 모듈](/api/device-info) 문서를 확인하세요
- 사용 예제는 [예제](/examples/basic-usage)를 참조하세요
