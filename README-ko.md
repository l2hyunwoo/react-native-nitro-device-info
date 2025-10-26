# react-native-nitro-device-info

> Nitro 모듈을 활용해 React Native에서 디바이스 정보를 빠르고 포괄적으로 가져옵니다.

<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/v/react-native-nitro-device-info.svg?style=flat-square" alt="npm version"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dm/react-native-nitro-device-info.svg?style=flat-square" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dt/react-native-nitro-device-info.svg?style=flat-square" alt="npm total downloads"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>

📖 **[전체 문서 읽기](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/)** | [English Docs](https://l2hyunwoo.github.io/react-native-nitro-device-info/)

[Nitro 모듈](https://nitro.margelo.com/) 기반으로, JSI를 통해 **제로 오버헤드 네이티브 접근**을 제공하는 고성능 React Native 디바이스 정보 라이브러리입니다.

## 주요 특징

- 🚀 **제로 오버헤드 JSI 바인딩** — JavaScript에서 네이티브 코드로 직접 접근
- 📱 **100개 이상의 속성 제공** — 포괄적인 디바이스 정보 조회
- 📦 **TypeScript 우선 설계** — 완전한 타입 정의 포함

## 설치 방법

```sh
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **참고:** `react-native-nitro-modules` 버전 ^0.31.0 이상이 필요합니다.

### iOS 설정

```sh
cd ios && pod install && cd ..
```

### Android 설정

별도의 설정이 필요 없습니다.
Gradle 자동 링크가 모든 작업을 처리합니다.

## 빠른 시작

### 기본 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 동기 속성 (즉시 - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"
console.log(DeviceInfoModule.model); // "iPhone"

// 동기 메서드 (즉시 - <1ms)
const uniqueId = DeviceInfoModule.getUniqueId();
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.getManufacturer();
console.log(manufacturer); // "Apple"

const isTablet = DeviceInfoModule.isTablet();
console.log(isTablet); // false

const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`배터리: ${(batteryLevel * 100).toFixed(0)}%`); // "배터리: 85%"

// 비동기 메서드 (Promise 기반 - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"

const carrier = await DeviceInfoModule.getCarrier();
console.log(carrier); // "SK Telecom"
```

### 고급 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, DeviceType } from 'react-native-nitro-device-info';

// 디바이스 식별
const deviceId = DeviceInfoModule.deviceId; // "iPhone14,2"
const manufacturer = DeviceInfoModule.getManufacturer(); // "Apple"
const uniqueId = DeviceInfoModule.getUniqueId(); // "FCDBD8EF-..."

// 디바이스 기능
const isTablet = DeviceInfoModule.isTablet(); // false
const hasNotch = DeviceInfoModule.hasNotch(); // true
const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland(); // false
const isCameraPresent = DeviceInfoModule.isCameraPresent(); // true
const isEmulator = DeviceInfoModule.isEmulator(); // false

// 시스템 리소스
const totalMemory = DeviceInfoModule.getTotalMemory();
const usedMemory = DeviceInfoModule.getUsedMemory();
const totalDisk = DeviceInfoModule.getTotalDiskCapacity();
const freeDisk = DeviceInfoModule.getFreeDiskStorage();

console.log(
  `RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`
);
console.log(
  `저장공간: ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB 중 ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB 사용 가능`
);

// 배터리 정보
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const isCharging = DeviceInfoModule.isBatteryCharging();
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(
  `배터리: ${(batteryLevel * 100).toFixed(0)}% ${isCharging ? '(충전 중)' : ''}`
);
console.log(`저전력 모드: ${powerState.lowPowerMode}`);

// 앱 메타데이터
const version = DeviceInfoModule.getVersion();
const buildNumber = DeviceInfoModule.getBuildNumber();
const bundleId = DeviceInfoModule.getBundleId();
const appName = DeviceInfoModule.getApplicationName();

console.log(`${appName} (${bundleId})`);
console.log(`버전: ${version} (${buildNumber})`);

// 네트워크 및 연결 (비동기)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();

console.log(`IP: ${ipAddress}`);
console.log(`통신사: ${carrier}`);
console.log(`위치 서비스: ${isLocationEnabled ? '활성화' : '비활성화'}`);

// 플랫폼별
const apiLevel = DeviceInfoModule.getApiLevel(); // Android: 33, iOS: -1
const abis = DeviceInfoModule.getSupportedAbis(); // ["arm64-v8a"]
const hasGms = DeviceInfoModule.hasGms(); // Android 전용
```

## API 레퍼런스

100개 이상의 모든 메서드와 속성에 대한 완전한 API 문서는 **[API-REFERENCE-ko.md](API-REFERENCE-ko.md)**를 참고하세요.

### 빠른 참조

#### 주요 속성 (동기 - <1ms)

```typescript
DeviceInfoModule.deviceId; // "iPhone14,2"
DeviceInfoModule.brand; // "Apple"
DeviceInfoModule.systemVersion; // "15.0"
DeviceInfoModule.model; // "iPhone"
```

#### 주요 메서드

```typescript
// 디바이스 정보
DeviceInfoModule.getUniqueId(); // 동기
DeviceInfoModule.isTablet(); // 동기
DeviceInfoModule.getTotalMemory(); // 동기
DeviceInfoModule.getBatteryLevel(); // 동기

// 앱 정보
DeviceInfoModule.getVersion(); // 동기
DeviceInfoModule.getBundleId(); // 동기

// 네트워크 (비동기)
await DeviceInfoModule.getIpAddress(); // ~20-50ms
await DeviceInfoModule.getCarrier(); // ~20-50ms
```

모든 메서드, 속성 및 상세 문서는 **[API-REFERENCE-ko.md](API-REFERENCE-ko.md)**를 참고하세요.

## 타입 정의

라이브러리는 완전한 TypeScript 정의를 포함합니다. 전체 타입 문서는 [API-REFERENCE-ko.md](API-REFERENCE-ko.md#타입-정의)를 참고하세요.

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';
```

## react-native-device-info에서 마이그레이션

`react-native-device-info`에서 옮겨오는 경우, 약 80%의 API가 그대로 호환됩니다.

### 이전 (react-native-device-info)

```typescript
import DeviceInfo from 'react-native-device-info';

// 모든 것이 비동기이거나 메서드 기반
const deviceId = DeviceInfo.getDeviceId();
const brand = DeviceInfo.getBrand();
const uniqueId = await DeviceInfo.getUniqueId();
const totalMemory = await DeviceInfo.getTotalMemory();
const batteryLevel = await DeviceInfo.getBatteryLevel();
const isTablet = DeviceInfo.isTablet();
```

### 이후 (react-native-nitro-device-info)

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 속성은 이제 직접 접근 가능한 getter
const deviceId = DeviceInfoModule.deviceId; // 메서드가 아닌 속성
const brand = DeviceInfoModule.brand; // 메서드가 아닌 속성

// 대부분의 메서드가 이제 동기
const uniqueId = DeviceInfoModule.getUniqueId(); // 이제 동기!
const totalMemory = DeviceInfoModule.getTotalMemory(); // 이제 동기!
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // 이제 동기!
const isTablet = DeviceInfoModule.isTablet(); // 이전과 동일

// 네트워크/연결만 비동기로 유지
const ipAddress = await DeviceInfoModule.getIpAddress();
```

**주요 변경점**

- TurboModule 대신 Nitro HybridObject(JSI) 사용으로 제로 오버헤드 호출
- 핵심 디바이스 속성은 이제 직접 속성 접근 (메서드 아님)
- 대부분의 메서드가 동기 방식으로 즉시 접근 가능 (<1ms)
- I/O 기반 작업(네트워크, 설치 시각)만 비동기로 유지

## 예제 앱

이 저장소에는 라이브러리를 쉽게 테스트할 수 있는 두 가지 예제 앱이 포함되어 있습니다.

### 쇼케이스 앱 (`example/showcase/`)

모든 디바이스 정보를 한눈에 보여주는 단일 화면 예제입니다.
**목적:** 라이브러리의 전체 API를 시각적으로 확인하고 테스트할 수 있습니다.

**실행 방법:**

```bash
# 저장소 루트에서
yarn showcase start
yarn showcase ios
yarn showcase android

# 또는 개별 디렉토리에서
cd example/showcase
yarn start
yarn ios
yarn android
```

### 벤치마크 앱 (`example/benchmark/`)

Nitro 모듈의 성능을 측정하기 위한 독립적인 테스트 앱입니다.
**목적:** 성능 및 스트레스 테스트, 다른 구현체와의 비교.

**실행 방법:**

```bash
# 저장소 루트에서
yarn benchmark start
yarn benchmark ios
yarn benchmark android

# 또는 개별 디렉토리에서
cd example/benchmark
yarn start
yarn ios
yarn android
```

자세한 내용은 아래 문서를 참고하세요.

- [쇼케이스 앱 README](example/showcase/README-ko.md)
- [벤치마크 앱 README](example/benchmark/README-ko.md)

## 지원 플랫폼

- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)

## 기여하기

개발 가이드라인과 워크플로우는 [CONTRIBUTING-ko.md](CONTRIBUTING-ko.md)를 참고하세요.

## 라이선스

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
