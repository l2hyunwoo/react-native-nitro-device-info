# react-native-nitro-device-integrity

[English](README.md) | **한국어**

React Native에서 하드웨어 기반 **device attestation**을 사용할 때 설치하는 선택 패키지입니다. 기기에서 발급한 토큰을 서버에서 검증하는 방식입니다. [Nitro Modules](https://nitro.margelo.com/)로 구현했으며 [`react-native-nitro-device-info`](https://github.com/l2hyunwoo/react-native-nitro-device-info)를 보완합니다.

**미배포**: 2026-10-10 기준 소스 레포지터리에만 있으며 npm 배포 이력이 없습니다. 매니페스트 `0.1.0`은 배포 버전이 아닙니다. 아래 npm 설치 명령은 배포 후에 적용됩니다.

- **Android** → [Play Integrity API](https://developer.android.com/google/play/integrity)
- **iOS** → [App Attest(`DCAppAttestService`)](https://developer.apple.com/documentation/devicecheck/dcappattestservice) + [DeviceCheck(`DCDevice`)](https://developer.apple.com/documentation/devicecheck/dcdevice)

> **device attestation 토큰을 발급할 뿐 검증은 하지 않습니다.** 모든 메서드는 불투명한 토큰을 반환합니다. **자체 백엔드에 보내 검증해야 합니다.** 기기가 안전한지 라이브러리가 결정하지 않습니다. [책임 범위](#책임-범위)를 참고하세요.

## 별도 패키지로 제공하는 이유

핵심 패키지의 `isDeviceCompromised()`는 로컬 검사이며 Magisk + Shamiko, RootHide 등으로 우회할 수 있습니다. 서버에서 검증할 device attestation에는 추가 네이티브 의존성(`com.google.android.play:integrity`), 플랫폼 기능(App Attest entitlement), Google/Apple 콘솔 설정이 필요합니다. 별도 선택 패키지로 분리해 필요한 앱에만 의존성과 설정을 추가합니다.

| 항목 | 핵심 `isDeviceCompromised()` | 이 패키지 |
| --- | --- | --- |
| 방식 | 로컬에서 징후를 확인하는 검사 | OS 공급업체의 하드웨어 기반 attestation |
| 네트워크 | 오프라인 | 필요 |
| 신뢰 | 첫 단계 검사. 쉽게 우회 가능 | 서버 검증. 강한 신호 |
| 용도 | 빠른 사전 검사 | 서버에서 검증한 최종 판단 근거 |

두 방식은 **상호 보완적**입니다. 핵심 검사는 빠른 오프라인 사전 필터로 사용하고 이 패키지의 토큰은 서버에서 검증한 뒤 판단 근거로 사용하세요.

## 설치

```sh
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

peer dependencies `react-native-nitro-modules`가 필요합니다. 패키지의 네이티브 최소 버전은 iOS 14.0과 Android API 24이며 의존성에 따라 높아질 수 있습니다. DeviceCheck 자체는 iOS 11부터 있지만 이 패키지는 iOS 11 설치를 지원하지 않습니다. Android에는 Google Play Services가 필요합니다.

## 책임 범위

| 작업 | 담당 |
| --- | --- |
| 기기에서 토큰 / attestation / assertion 발급 | **라이브러리** |
| `clientDataHash`(SHA-256) 계산과 클라이언트 데이터 구성 | **앱** |
| 토큰을 백엔드로 전송 | **앱** |
| 복호화 / 서명 검증 / 판정 해석 | **서버** |
| App Attest `keyId` 저장 | **앱**. 라이브러리는 상태를 보관하지 않음 |
| Google Cloud / Apple 콘솔 설정 | **개발자** |

## 사용법

```ts
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

if (integrity.providerType === 'playIntegrity') {
  // --- Android: Play Integrity (Standard) ---
  await integrity.prepareStandardProvider('123456789012'); // your Cloud project number, once
  const requestHash = '<base64 SHA-256 of your request params>';
  const token = await integrity.requestIntegrityToken(requestHash);
  // POST `token` to your server → Google :decodeIntegrityToken
} else if (integrity.providerType === 'appAttest') {
  // --- iOS: App Attest ---
  const keyId = await integrity.generateKey();          // persist this yourself
  const clientDataHash = '<base64 SHA-256 of your server challenge>';
  const attestation = await integrity.attestKey(keyId, clientDataHash); // once
  // POST { keyId, attestation } to your server for one-time validation
  // Each subsequent request needs a fresh one-time challenge.
  const challenge = await fetchChallengeFromYourServer();
  const clientData = JSON.stringify({ challenge, payload });
  const assertion = await integrity.generateAssertion(keyId, base64Sha256(clientData));
  // POST { keyId, assertion, clientData } to your server
}
```

### `clientDataHash`(iOS)

App Attest에는 **이미 해시한** 32바이트 값을 base64로 전달해야 합니다. 키 attestation에는 서버의 일회용 challenge를 해시하세요. 각 assertion에는 서버에서 새로 받은 challenge와 요청 payload를 포함한 client data를 해시하세요. 해시한 문자열을 그대로 서버에 보내 검증해야 합니다. 예제의 해시 함수와 백엔드 통신 함수는 앱에서 구현해야 하며 라이브러리는 해시를 계산하지 않습니다.
잘못된 base64는 iOS에서 `INVALID_BASE64`로 reject됩니다. 해독한 길이가 32바이트가 아니면 시뮬레이터를 포함해 `INVALID_INPUT`으로 reject됩니다.

### 오류

오류 코드는 `Error.message` 앞부분에 포함됩니다. JavaScript `error.code` 속성은 별도로 보장하지 않습니다.

| 메시지 앞부분 | 의미 |
| --- | --- |
| `CLOUD_PROJECT_NUMBER_IS_INVALID` | 프로젝트 번호는 양의 부호 있는 64비트 정수 문자열이어야 함. |
| `PROVIDER_NOT_PREPARED` | 토큰 요청 전에 Standard provider를 준비해야 함. |
| `STANDARD_INTEGRITY_ERROR_<숫자 코드>` | Standard SDK 오류. 무효화된 provider(`-19`)는 한 번 새로 준비하고 재시도함. |
| `CLASSIC_INTEGRITY_ERROR_<숫자 코드>` | Classic SDK 오류. |
| `INVALID_BASE64`, `INVALID_INPUT` | iOS 해시 인코딩·해독 길이 오류 또는 Apple의 잘못된 입력 오류. |
| `UNSUPPORTED_PLATFORM` | 다른 플랫폼의 메서드를 호출했거나 iOS 하드웨어가 지원하지 않음. |

Apple 오류는 `INVALID_KEY`, `SERVER_UNAVAILABLE`, `FEATURE_UNSUPPORTED`, `UNKNOWN_SYSTEM_FAILURE`, `UNKNOWN`으로 시작할 수도 있습니다. 다른 네이티브 오류는 원래 메시지를 유지합니다. Google SDK 오류는 숫자 코드를 유지하므로 네트워크 오류는 `NETWORK_ERROR`가 아니라 `STANDARD_INTEGRITY_ERROR_-3`입니다. [Standard SDK 오류 코드](https://developer.android.com/google/play/integrity/reference/com/google/android/play/core/integrity/model/StandardIntegrityErrorCode)를 참고하세요.

## 서버 검증(개발자 책임)

라이브러리는 토큰 발급까지만 담당합니다. 백엔드에서 검증해야 합니다.

### Play Integrity(Android)

토큰을 서버로 보내고 Google의 decode 엔드포인트를 호출하세요(권장).

```http
POST https://playintegrity.googleapis.com/v1/{packageName}:decodeIntegrityToken
```

`deviceIntegrity.deviceRecognitionVerdict`의 `MEETS_DEVICE_INTEGRITY` 포함 여부, `appIntegrity.appRecognitionVerdict === PLAY_RECOGNIZED` 등을 해석하세요. **빈** `deviceRecognitionVerdict`는 보안이 침해된 기기나 에뮬레이터를 시사하는 신호입니다. [Play Integrity 판정](https://developer.android.com/google/play/integrity/verdicts)을 참고하세요.

### App Attest(iOS)

키마다 **한 번** Apple App Attest Root CA를 기준으로 attestation을 검증합니다(인증서 체인, nonce, app-ID 해시, counter = 0). 공개 키와 카운터를 저장하고 이후 각 **assertion**의 서명과 단조 증가 카운터를 검증하세요. client data의 challenge가 서버에서 발급한 미사용 값과 일치하는지도 확인하세요. [서버에 연결하는 앱 검증](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server)을 참고하세요.

## 필요한 설정

### Android(Play Integrity)

1. **Google Cloud** 프로젝트를 만들거나 선택하고 Play Integrity API를 켜세요.
2. **Play Console** → *Play Integrity API*에서 연결하세요.
3. **Cloud 프로젝트 번호**를 `prepareStandardProvider` / `requestClassicIntegrityToken`에 전달하세요.
4. 서버에서 Google 서비스 계정 또는 응답 암호화 키를 설정하세요.

### iOS(App Attest / DeviceCheck)

1. 앱 타깃에 **App Attest** 기능을 추가하세요(Xcode → Signing & Capabilities). `com.apple.developer.devicecheck.appattest-environment` entitlement를 추가합니다(`development` / `production`).
2. DeviceCheck 서버 조회용 `.p8` 키를 Apple Developer 포털에서 만드세요.

> 이 설정은 개발자 계정과 앱 타깃에서 관리합니다. 라이브러리가 대신 설정할 수는 없습니다.

## 소스 레포지터리에서 검증하기

워크스페이스 의존성을 설치한 뒤 레포지터리 루트에서 실행하세요.

```sh
yarn test:integrity
yarn test:integrity:android
yarn test:integrity:ios
```

첫 번째 검사는 Android 런타임 의존성, Expo 플러그인의 반복 적용, 데모 SHA-256 테스트 벡터를 확인합니다. `android/src/test`의 Android JUnit 테스트는 데모의 Gradle 프로젝트에서 실행합니다. 실제 구현과 mock한 Google SDK 타입으로 provider 갱신 경쟁 조건, 재시도 횟수 제한, 잘못된 프로젝트 번호를 검사합니다. JDK 17과 데모에서 사용하는 Android SDK가 필요합니다. Kotlin 컴파일러는 Gradle이 제공하므로 별도로 설치하지 않습니다.

iOS 검사는 실제 Swift 구현을 작은 플랫폼 대역과 컴파일해 해독한 해시를 검사합니다. macOS와 Xcode의 `swiftc`, Foundation이 필요합니다. CI는 각 플랫폼 job에서 해당 네이티브 테스트를 실행합니다. Google·Apple 서버는 호출하지 않습니다.

네이티브 오류가 JavaScript까지 전달되는지 확인하려면 선택한 시뮬레이터에 데모의 **Debug** 앱을 먼저 설치하세요. 설치된 iPhone 17 Pro 런타임 버전에 맞춰 하네스를 실행하세요.

```sh
yarn workspace react-native-nitro-device-integrity-demo ios --simulator 'iPhone 17 Pro' --no-packager
INTEGRITY_IOS_VERSION=26.5 yarn workspace react-native-nitro-device-integrity-demo test:e2e:ios
```

하네스가 Metro를 시작합니다. 시뮬레이터에서는 지원 여부, 해시 입력 오류, 플랫폼 전용 메서드의 reject를 검사합니다. Release 앱은 번들에 포함된 JavaScript를 사용하므로 이 하네스 검사를 실행할 수 없습니다. Android 검사는 `example/integrity-demo/rn-harness.config.mjs`에서 선택한 기기가 연결돼 있어야 합니다.

데모는 고정된 테스트 challenge를 사용하며 발급한 토큰을 검증하지 않습니다. 실제 attestation에는 계정 설정과 실기기가 필요합니다. 보호할 작업을 허용하기 전에 백엔드에서 발급한 토큰을 검증하세요. 시뮬레이터, 대역, 빌드, 클라이언트 검사만으로 서버 검증 성공을 확인할 수는 없습니다.

## 제한 사항

- **App Attest는 탈옥 탐지기가 아닙니다.** 실제 Apple 하드웨어에서 변조하지 않은 정식 앱이 실행 중임을 증명합니다. 루팅·탈옥 탐지 대신 긍정적인 신호로 사용하세요.
- **시뮬레이터 / 에뮬레이터**: iOS 시뮬레이터의 `isSupported`는 `false`입니다. Play Integrity는 에뮬레이터에서 약하거나 빈 판정을 반환합니다.
- **루팅 기기**: Play Integrity는 토큰을 반환하지만 `deviceRecognitionVerdict`가 비어 있습니다. 서버에서 실패로 처리해야 합니다.
- **우회 방법이 존재합니다**(PlayIntegrityFix 등). 더 넓은 부정 사용 방지 전략의 한 신호로 사용하세요.
- **네트워크가 필요합니다.** Google Cloud / Apple 설정이 없으면 발급이 실패합니다. 발급 요청의 reject를 처리하고 이를 기기가 안전하다는 뜻으로 받아들이지 마세요.
- **App Attest 호출 제한**: Apple은 `attestKey` 호출 빈도를 제한합니다. 앱에서 빈도를 제어하세요. 상태를 보관하지 않는 라이브러리는 재시도나 타이머를 추가하지 않습니다.

## 라이선스

MIT
