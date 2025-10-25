# react-native-nitro-device-info

> Nitro 모듈을 활용해 React Native에서 디바이스 정보를 빠르고 포괄적으로 가져옵니다.

[![npm version](https://badge.fury.io/js/react-native-nitro-device-info.svg)](https://badge.fury.io/js/react-native-nitro-device-info)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Nitro 모듈](https://nitro.margelo.com/) 기반으로, JSI를 통해 **제로 오버헤드 네이티브 접근**을 제공하는 고성능 React Native 디바이스 정보 라이브러리입니다.

## 주요 특징

- 🚀 **제로 오버헤드 JSI 바인딩** — JavaScript에서 네이티브 코드로 직접 접근
- ⚡️ **동기 액세스 지원** — 캐시된 디바이스 속성 즉시 접근 (<1ms)
- 🔄 **비동기 메서드 지원** — Promise 기반의 I/O 작업 (<100ms)
- 📱 **50개 이상의 속성 제공** — 포괄적인 디바이스 정보 조회
- 🎯 **약 80% API 호환성** — `react-native-device-info`와 대부분의 사용 사례 호환
- 📦 **TypeScript 우선 설계** — 완전한 타입 정의 포함
- 🌍 **크로스 플랫폼 지원** — iOS 13.4+, Android API 21+ 호환

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

// 동기 접근 (즉시 - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"

// 동기 메서드 (즉시 - <1ms)
const uniqueId = DeviceInfoModule.getUniqueId();
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const powerState = DeviceInfoModule.getPowerState();
console.log(powerState);
// {
//   batteryLevel: 0.75,
//   batteryState: 'charging',
//   lowPowerMode: false
// }

// 비동기 메서드 (Promise 기반 - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"
```

### 고급 사용법

```typescript
import { createDeviceInfo } from 'react-native-nitro-device-info';
import type { DeviceInfo, PowerState } from 'react-native-nitro-device-info';

// 디바이스 정보 인스턴스 생성
const deviceInfo: DeviceInfo = createDeviceInfo();

// 디바이스 식별 (동기)
const deviceId = deviceInfo.deviceId;
const manufacturer = deviceInfo.getManufacturer();
const uniqueId = deviceInfo.getUniqueId();

// 디바이스 기능 (동기)
const isTablet = deviceInfo.isTablet();
const hasNotch = deviceInfo.hasNotch();
const hasDynamicIsland = deviceInfo.hasDynamicIsland();
const isCameraPresent = deviceInfo.isCameraPresent();

// 시스템 리소스 (동기)
const totalMemory = deviceInfo.getTotalMemory();
const freeStorage = deviceInfo.getFreeDiskStorage();
console.log(`메모리: ${(totalMemory / 1024 / 1024 / 1024).toFixed(2)} GB`);
console.log(
  `사용 가능한 저장공간: ${(freeStorage / 1024 / 1024 / 1024).toFixed(2)} GB`
);

// 배터리 정보 (동기)
const batteryLevel = deviceInfo.getBatteryLevel();
console.log(`배터리 잔량: ${(batteryLevel * 100).toFixed(0)}%`);

// 앱 메타데이터 (동기)
const version = deviceInfo.getVersion();
const buildNumber = deviceInfo.getBuildNumber();
const bundleId = deviceInfo.getBundleId();
console.log(`${bundleId} v${version} (${buildNumber})`);

// 네트워크 정보 (비동기)
const ipAddress = await deviceInfo.getIpAddress();
const carrier = await deviceInfo.getCarrier();
console.log(`IP: ${ipAddress}, 통신사: ${carrier}`);
```

## API 레퍼런스

### 동기 속성

즉시 접근 가능한 캐시된 속성들입니다:

| 속성            | 타입         | 설명                 | 예시           |
| --------------- | ------------ | -------------------- | -------------- |
| `deviceId`      | `string`     | 디바이스 모델 식별자 | `"iPhone14,2"` |
| `brand`         | `string`     | 제조사 이름          | `"Apple"`      |
| `systemName`    | `string`     | 운영체제 이름        | `"iOS"`        |
| `systemVersion` | `string`     | OS 버전              | `"15.0"`       |
| `model`         | `string`     | 모델명               | `"iPhone"`     |
| `deviceType`    | `DeviceType` | 디바이스 카테고리    | `"Handset"`    |

### 동기 메서드

아래 모든 메서드는 캐시된 값을 즉시 반환합니다 (<1ms):

#### 디바이스 식별

| 메서드               | 반환값    | 설명                  |
| -------------------- | --------- | --------------------- |
| `getUniqueId()`      | `string`  | 고유 디바이스 ID      |
| `getManufacturer()`  | `string`  | 제조사 이름           |

#### 디바이스 기능

| 메서드                     | 반환값    | 설명                            |
| -------------------------- | --------- | ------------------------------- |
| `isTablet()`               | `boolean` | 태블릿 여부 확인                |
| `hasNotch()`               | `boolean` | 디스플레이 노치 유무 (iOS 전용) |
| `hasDynamicIsland()`       | `boolean` | Dynamic Island 유무 (iOS 16+)   |
| `isCameraPresent()`        | `boolean` | 카메라 사용 가능 여부           |
| `isPinOrFingerprintSet()`  | `boolean` | 생체 인증 설정 여부             |
| `isEmulator()`             | `boolean` | 에뮬레이터/시뮬레이터 여부      |

#### 시스템 리소스

| 메서드                   | 반환값   | 설명                       |
| ------------------------ | -------- | -------------------------- |
| `getTotalMemory()`       | `number` | 전체 RAM 용량 (bytes)      |
| `getUsedMemory()`        | `number` | 현재 앱 메모리 사용량      |
| `getTotalDiskCapacity()` | `number` | 전체 저장공간 (bytes)      |
| `getFreeDiskStorage()`   | `number` | 사용 가능한 저장공간 (bytes) |

#### 배터리 정보

| 메서드                | 반환값       | 설명                     |
| --------------------- | ------------ | ------------------------ |
| `getBatteryLevel()`   | `number`     | 배터리 잔량 (0.0 ~ 1.0)  |
| `getPowerState()`     | `PowerState` | 포괄적인 전원 상태       |
| `isBatteryCharging()` | `boolean`    | 충전 중 여부             |

#### 애플리케이션 메타데이터

| 메서드                 | 반환값   | 설명                            |
| ---------------------- | -------- | ------------------------------- |
| `getVersion()`         | `string` | 앱 버전                         |
| `getBuildNumber()`     | `string` | 빌드 번호                       |
| `getBundleId()`        | `string` | 번들 ID 또는 패키지명           |
| `getApplicationName()` | `string` | 앱 이름                         |

#### 플랫폼별 메서드

| 메서드                | 반환값     | 설명                                 |
| --------------------- | ---------- | ------------------------------------ |
| `getApiLevel()`       | `number`   | Android API 레벨 (iOS는 -1)          |
| `getSupportedAbis()`  | `string[]` | 지원 CPU 아키텍처                    |
| `hasGms()`            | `boolean`  | Google Mobile Services (Android 전용) |
| `hasHms()`            | `boolean`  | Huawei Mobile Services (Android 전용) |

### 비동기 메서드

아래 모든 메서드는 Promise를 반환하며 일반적으로 10-100ms 내에 완료됩니다:

#### 애플리케이션 메타데이터

- `getFirstInstallTime(): Promise<number>` — 최초 설치 시각 (epoch 기준 ms)
- `getLastUpdateTime(): Promise<number>` — 마지막 업데이트 시각

#### 네트워크 및 연결

- `getIpAddress(): Promise<string>` — IP 주소
- `getMacAddress(): Promise<string>` — MAC 주소 (iOS 7+에서는 비활성화됨)
- `getCarrier(): Promise<string>` — 이동통신사 이름
- `isLocationEnabled(): Promise<boolean>` — 위치 서비스 활성 상태
- `isHeadphonesConnected(): Promise<boolean>` — 헤드폰 연결 여부

## 타입 정의

### PowerState

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 ~ 1.0
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS 전용
}
```

### DeviceType

```typescript
type DeviceType =
  | 'Handset'
  | 'Tablet'
  | 'Tv'
  | 'Desktop'
  | 'GamingConsole'
  | 'unknown';
```

### BatteryState

```typescript
type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';
```

## react-native-device-info에서 마이그레이션

`react-native-device-info`에서 옮겨오는 경우, 약 80%의 API가 그대로 호환됩니다.

### 이전 (react-native-device-info)

```typescript
import DeviceInfo from 'react-native-device-info';

const deviceId = DeviceInfo.getDeviceId();
const uniqueId = await DeviceInfo.getUniqueId();
const isTablet = DeviceInfo.isTablet();
```

### 이후 (react-native-nitro-device-info)

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const deviceId = DeviceInfoModule.deviceId; // 이제 동기 속성입니다!
const uniqueId = DeviceInfoModule.getUniqueId(); // 이제 동기 메서드입니다 (이전엔 비동기)!
const isTablet = DeviceInfoModule.isTablet(); // 동일한 메서드
```

**주요 변경점**

- TurboModule → Nitro HybridObject 기반
- 대부분의 메서드가 동기 방식으로 전환되어 즉시 접근 가능 (<1ms)
- 네트워크/연결 관련 메서드와 설치 시각 메서드만 비동기로 유지

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

- **iOS:** 13.4 이상 (99%+ 디바이스)
- **Android:** API 21 이상 (Android 5.0 Lollipop, 99%+ 디바이스)

## 기여하기

개발 가이드라인과 워크플로우는 [CONTRIBUTING-ko.md](CONTRIBUTING-ko.md)를 참고하세요.

### 코드 품질 유지

다음 자동화된 정적 코드 분석 도구를 사용합니다:

- **TypeScript**: `yarn typecheck` — 타입 검사
- **린트**: `yarn lint` 또는 `yarn lint:eslint` — 기본 oxlint, 옵션으로 ESLint
- **Kotlin**: `ktlint` — Android 코드 포매팅

**Kotlin 코드 포매팅 예시 (커밋 전 실행):**

```sh
cd example/showcase/android  # 또는 example/benchmark/android
./gradlew :react-native-nitro-device-info:ktlintFormat
```

> 자세한 내용은 [ktlint 빠른 시작 가이드](specs/002-cleanup-boilerplate-add-ktlint/quickstart.md)를 참고하세요.

## 라이선스

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
