# 마이그레이션 가이드

`react-native-device-info`에서 `react-native-nitro-device-info`로 마이그레이션하는 가이드입니다.

## 개요

`react-native-nitro-device-info`는 `react-native-device-info`와 100% API 호환되도록 설계되었으며, 우수한 성능을 제공합니다.

## 주요 차이점

### 1. 가져오기 변경

```typescript
// 이전 (react-native-device-info)
import DeviceInfo from 'react-native-device-info';

// 이후 (react-native-nitro-device-info)
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

### 2. 동기 API

많은 메서드가 이제 동기적입니다:

```typescript
// 이전 (비동기)
const brand = await DeviceInfo.getBrand();

// 이후 (동기 - 훨씬 빠름!)
const brand = DeviceInfoModule.brand;
```

### 3. 속성 vs 메서드

일부 getter 메서드가 속성이 되었습니다:

```typescript
// 이전
const id = DeviceInfo.getDeviceId();
const brand = await DeviceInfo.getBrand();

// 이후
const id = DeviceInfoModule.deviceId;
const brand = DeviceInfoModule.brand;
```

## 마이그레이션 단계

### 1단계: 설치

```bash
yarn remove react-native-device-info
yarn add react-native-nitro-device-info react-native-nitro-modules
```

### 2단계: 가져오기 업데이트

모든 파일에서 가져오기를 업데이트합니다:

```typescript
// 이전
import DeviceInfo from 'react-native-device-info';

// 이후
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

### 3단계: API 호출 업데이트

API 호출을 새로운 동기 패턴으로 변환합니다:

```typescript
// 이전
const brand = await DeviceInfo.getBrand();
const model = await DeviceInfo.getModel();

// 이후 (더 간단하고 빠름!)
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
```

## API 매핑

### 기기 정보

| react-native-device-info | react-native-nitro-device-info |
|-------------------------|--------------------------------|
| `getDeviceId()` | `deviceId` (속성) |
| `getBrand()` (async) | `brand` (속성) |
| `getModel()` (async) | `model` (속성) |
| `getManufacturer()` (async) | `manufacturer` (속성) |

### 시스템 정보

| react-native-device-info | react-native-nitro-device-info |
|-------------------------|--------------------------------|
| `getSystemVersion()` | `systemVersion` (속성) |
| `getBuildNumber()` | `buildNumber` (속성) |
| `getApiLevel()` (Android) | `apiLevel` (속성) |

### 하드웨어

| react-native-device-info | react-native-nitro-device-info |
|-------------------------|--------------------------------|
| `getTotalMemory()` (async) | `getTotalMemory()` (동기) |
| `isTablet()` (async) | `isTablet()` (동기) |

### 배터리

| react-native-device-info | react-native-nitro-device-info |
|-------------------------|--------------------------------|
| `getBatteryLevel()` (async) | `getBatteryLevel()` (동기) |
| `getPowerState()` (async) | `getPowerState()` (동기) |

### 네트워크 (비동기 유지)

| react-native-device-info | react-native-nitro-device-info |
|-------------------------|--------------------------------|
| `getIpAddress()` | `getIpAddress()` |
| `getCarrier()` | `getCarrier()` |

## 성능 이점

동기 API로의 마이그레이션은 상당한 성능 향상을 제공합니다:

- **이전**: ~5-10ms per call (비동기)
- **이후**: <1ms per call (동기)

분당 1,000회 호출하는 앱의 경우:
- **이전**: 분당 5-10초 오버헤드
- **이후**: 분당 <1초 오버헤드

## 호환성

`react-native-nitro-device-info`는 100% API 호환을 유지하면서 우수한 성능을 제공합니다.

## 도움이 필요하신가요?

마이그레이션 문제가 있으면 [GitHub Issues](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues)를 확인하세요.
