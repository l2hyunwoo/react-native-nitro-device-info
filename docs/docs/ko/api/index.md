---
translationOf: api/index.md
sourceCommit: fe4734e26c07bb1ad819c34784ba0e69391db281
---

# API 레퍼런스 개요 {#api-reference-overview}

예제를 복사하기 전에 패키지 루트와 `/compat` 중 어떤 API를 사용할지 선택하세요. 두 API는 이름과 반환 타입이 다릅니다.

## 어떤 API를 import해야 하나요? {#entry-points}

| import | 용도 | 예시 |
| --- | --- | --- |
| `react-native-nitro-device-info`의 `{ DeviceInfoModule }` | 네이티브 속성과 메서드 | `DeviceInfoModule.model` |
| `react-native-nitro-device-info/compat`의 `DeviceInfo` | `react-native-device-info` 15.x 형식의 함수 | `DeviceInfo.getModel()` |
| `react-native-nitro-device-info`의 `{ useBatteryLevel }` | 값을 반환하는 React 훅 | `number \| null` |
| `react-native-nitro-device-info/compat`의 `{ useIsHeadphonesConnected }` | 호환 훅 결과 | `{ loading, result }` |
| `react-native-nitro-device-integrity`의 `{ DeviceIntegrityModule }` | 백엔드에서 검증하는 device attestation | [device attestation](/api/device-attestation) 참고 |

루트의 `DeviceInfo`는 TypeScript 타입이며 런타임에 사용하는 기본 객체가 아닙니다. 호환성 주의 사항은 [마이그레이션](/api/migration)을 참고하세요.

## 지원 여부 배지 {#availability-badges}

각 API 섹션에는 최초 도입 버전과 현재 플랫폼 동작을 표시합니다. 속성을 묶어 설명하는 표에는 각 행에 배지를 표시합니다.

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

- **v…부터(Since)**: 이 멤버 이름과 속성·메서드 형태를 처음 배포한 버전입니다. 이전 릴리스는 반환 타입이나 동작이 다를 수 있습니다. 모든 플랫폼이 같은 릴리스에서 기능을 구현했다는 뜻은 아닙니다.
- **iOS / Android**: 동작하는 네이티브 구현을 뜻합니다. 숫자는 패키지 버전이 아닌 최소 OS 버전입니다. 플랫폼 배지 안의 별도 `v…부터(since v…)`는 실제 구현을 나중에 도입한 버전입니다. 현재 핵심 패키지는 iOS 15.1 이상과 Android API 24 이상이 필요합니다. 의존성에 따라 더 높은 최소 버전이 필요할 수 있습니다.
- **제한적 지원(Limited)**: 추정값, 제한된 구현, 브라우저 API 의존성을 뜻합니다. 사용 전에 해당 섹션의 제한을 읽으세요.
- **fallback**: 지원하지 않는 작업에서 고정 기본값을 반환합니다. **reject**는 해당 플랫폼에서 메서드의 Promise가 reject된다는 뜻입니다.
- **미배포(Unreleased)**: `main`에는 있지만 npm에 배포하지 않은 구현입니다. 버전 번호가 아닙니다.

웹용 entry point와 fallback 값은 **v1.8.0**부터 사용할 수 있습니다. `웹: 제한적 지원` 배지는 브라우저에서 값을 읽는다는 뜻입니다. 브라우저 권한, API 지원 여부, SSR에 따라 fallback 값을 반환할 수 있습니다. fallback 값이 네이티브 기능을 제공하지는 않습니다.

iOS의 카메라 감지와 기기 인증 구현은 v1.9.0부터 사용할 수 있습니다. v1.8.3까지의 핵심 패키지 릴리스에도 이름은 있지만 iOS에서는 상수를 반환합니다.

### 버전 근거 {#version-evidence}

도입 버전은 [배포된 npm 버전과 `gitHead` 값](https://registry.npmjs.org/react-native-nitro-device-info)을 대조했습니다. 다음 소스 스냅샷에서 멤버 선언을 확인할 수 있습니다.

| 배포 버전 | 소스 |
| --- | --- |
| v0.1.0 | [초기 인터페이스](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/0.1.0/src/DeviceInfo.nitro.ts) |
| v1.1.0 | [확장 인터페이스](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.1.0/src/DeviceInfo.nitro.ts) |
| v1.2.0 | [속성 기반 인터페이스](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.2.0/src/DeviceInfo.nitro.ts) |
| v1.2.1 | [키 저장소와 Liquid Glass 선언](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.2.1/src/DeviceInfo.nitro.ts) |
| v1.3.0 | [런타임 getter 인터페이스](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.3.0/src/DeviceInfo.nitro.ts) |
| v1.4.0 | [React 훅 export](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.4.0/src/hooks/index.ts) |
| v1.4.2 | [로컬 무결성과 Expo Device 대응 선언](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.4.2/src/DeviceInfo.nitro.ts) |
| v1.5.0 | [통신사와 빌드 필드 선언](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.5.0/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts) |
| v1.8.0 | [동작하는 iOS 비동기 래퍼](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026)와 [웹용 entry point](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/v1.8.0/packages/react-native-nitro-device-info/src/index.web.ts) |

## 작업별 네이티브 API {#native-api-by-task}

다음 멤버는 `DeviceInfoModule`에 속합니다. 괄호가 있으면 메서드, 없으면 속성입니다.

| 작업 | 주요 멤버 | 레퍼런스 |
| --- | --- | --- |
| 모델과 OS 확인 | `deviceId`, `model`, `systemVersion`, `deviceType` | [기본 기기 정보](/api/device-info#core-device-information-9-apis) |
| 식별자 읽기 | `uniqueId`, `manufacturer`, `deviceName` | [기본 기기 정보](/api/device-info#core-device-information-9-apis) |
| 하드웨어 확인 | `isTablet`, `isEmulator`, `isCameraPresent`, `isPinOrFingerprintSet` | [기기 기능](/api/device-info#device-capabilities-7-apis) |
| 디스플레이 정보 읽기 | `getHasNotch()`, `getHasDynamicIsland()`, `getIsLandscape()`, `getBrightness()` | [디스플레이와 화면](/api/device-info#display--screen-7-apis) |
| 메모리와 저장 공간 읽기 | `totalMemory`, `getUsedMemory()`, `totalDiskCapacity`, `getFreeDiskStorage()` | [시스템 리소스](/api/device-info#system-resources-7-apis) |
| 배터리 상태 읽기 | `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | [배터리와 전원](/api/device-info#battery--power-4-apis) |
| 앱 메타데이터 읽기 | `version`, `buildNumber`, `bundleId`, `getFirstInstallTime()` | [앱 메타데이터](/api/device-info#application-metadata-9-apis) |
| 네트워크 정보 읽기 | `getIpAddress()`, `getIpAddressSync()`, `getMacAddress()` | [네트워크](/api/device-info#network-6-apis) |
| 통신사 정보 읽기 | `getCarrier()`, `getCarrierSync()`, `mobileCountryCode` | [통신사 정보](/api/device-info#carrier-information-7-apis) |
| 오디오 출력 확인 | `isHeadphonesConnected()`, `getIsWiredHeadphonesConnected()` | [오디오 기기](/api/device-info#audio-accessories-4-apis) |
| 위치 서비스 확인 | `isLocationEnabled()`, `getIsLocationEnabled()`, `getAvailableLocationProviders()` | [위치 서비스](/api/device-info#location-services-3-apis) |
| Android 기능 확인 | `apiLevel`, `getHasGms()`, `getHasHms()`, `hasSystemFeature(feature)` | [Android 플랫폼](/api/device-info#android-platform-20-apis) |
| Apple DeviceCheck 요청 또는 Keychain에 ID 기록 | `getDeviceToken()`, `syncUniqueId()` | [iOS 플랫폼](/api/device-info#ios-platform-2-apis) |
| 설치 정보 읽기 | `installerPackageName`, `getInstallReferrer()`, `isSideLoadingEnabled()` | [설치와 배포](/api/device-info#installation--distribution-3-apis) |

나머지 멤버는 [전체 DeviceInfo 레퍼런스](/api/device-info)를 참고하세요.

## 속성·메서드·훅은 어떻게 사용하나요? {#call-and-return-contracts}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const model: string = DeviceInfoModule.model;
const battery: number = DeviceInfoModule.getBatteryLevel();

async function readIpAddress(): Promise<string> {
  return await DeviceInfoModule.getIpAddress();
}
```

- **속성**: 괄호 없이 읽습니다. 속성도 OS를 조회할 수 있습니다. `readonly`가 상수라는 뜻은 아닙니다.
- **동기 메서드**: 직접 호출합니다. 동기 실행이 고정 지연 시간을 보장하지는 않습니다.
- **Promise 메서드**: 비동기 함수에서 await로 결과를 기다리고 실패할 수 있는 API의 reject를 처리하세요.
- **React 훅**: React 컴포넌트 또는 커스텀 훅 안에서 호출하세요. 초기값과 폴링 간격은 [훅 API](/api/hooks)를 참고하세요.

메모리와 저장 공간 단위는 바이트입니다. 배터리와 밝기는 조회할 수 있을 때 `0`~`1`의 비율입니다. 예를 들어 배터리 잔량을 읽을 수 없으면 `getBatteryLevel()`은 `-1`, `useBatteryLevel()`은 `null`을 반환합니다.

## 플랫폼과 보안 제한 {#platform-and-security-limits}

지원하지 않는 API는 fallback 값을 반환하거나 reject될 수 있습니다. `false`는 플랫폼에 구현이 없다는 뜻일 수도 있습니다. 개별 API와 [웹 지원 가이드](/guide/web-support)를 확인하세요.

이 패키지의 [로컬 기기 무결성 검사](/api/device-integrity)는 특정 징후로 판단하는 검사이며 우회할 수 있습니다. [device attestation](/api/device-attestation)은 별도 `react-native-nitro-device-integrity` 패키지와 백엔드 검증이 필요합니다.

## 타입과 소스 {#types-and-source}

`DeviceInfo`, `PowerState`, `BatteryState`, `DeviceType`, `NavigationMode`는 `import type`으로 import하세요. [타입 정의](/api/types)를 참고하세요.

현재 웹사이트는 레포지터리의 `main` 브랜치를 기준으로 작성합니다. 이전 릴리스를 설치했다면 해당 릴리스의 선언을 확인하세요. API 시그니처의 원본은 [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts)이며 네이티브 구현이 플랫폼 동작을 정의합니다.
