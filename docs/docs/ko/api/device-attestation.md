---
translationOf: api/device-attestation.md
sourceCommit: fe4734e26c07bb1ad819c34784ba0e69391db281
---

# Device attestation API {#device-attestation-api}

선택 패키지 `react-native-nitro-device-integrity`는 하드웨어 기반 **device attestation** 토큰을 발급합니다. 기기가 보낸 토큰은 서버에서 검증해야 합니다.

<span class="rp-badge rp-badge--tip">v0.1.0부터</span>

이 페이지의 버전 배지는 integrity 패키지를 기준으로 합니다. npm의 [v0.1.0](https://www.npmjs.com/package/react-native-nitro-device-integrity/v/0.1.0)은 [이 소스](https://github.com/l2hyunwoo/react-native-nitro-device-info/tree/react-native-nitro-device-integrity%400.1.0/packages/react-native-nitro-device-integrity)에 해당합니다.

[지원 여부 배지 설명](/api/#availability-badges)을 읽으세요. Pod의 대상은 iOS 14 이상, Android 모듈의 대상은 API 24 이상입니다. 의존성은 더 높은 최소 버전을 요구할 수 있습니다. 웹용 entry point는 없습니다.

- **Android** → [Play Integrity API](https://developer.android.com/google/play/integrity)
- **iOS** → [App Attest(`DCAppAttestService`)](https://developer.apple.com/documentation/devicecheck/dcappattestservice) + [DeviceCheck(`DCDevice`)](https://developer.apple.com/documentation/devicecheck/dcdevice)

핵심 라이브러리와 **별개의 선택 패키지**이므로 device attestation이 필요할 때만 설치하세요. 설치하면 Play Integrity / App Attest 의존성이 추가됩니다. Google Cloud / Apple 콘솔 설정도 필요합니다.

:::tip Device attestation과 로컬 탐지
이 API는 핵심 [기기 무결성 API](./device-integrity)를 **보완**합니다.

- **로컬 탐지**([`isDeviceCompromised()`](./device-integrity)): 빠르고 오프라인에서 동작하지만 쉽게 우회할 수 있습니다. 첫 단계 사전 필터로 사용합니다.
- **device attestation**(이 페이지): 플랫폼이 발급한 결과를 **서버에서 검증**합니다.

서버에서 검증한 attestation과 서비스의 다른 위험 신호를 함께 사용해 접근 정책을 적용하세요.
:::

## 토큰 발급과 검증은 누가 담당하나요? {#the-responsibility-boundary}

:::warning 라이브러리는 토큰만 발급합니다. 검증은 서버에서 해야 합니다
토큰·attestation·assertion 발급 메서드는 **불투명한 값**을 반환합니다. 이 값만으로 기기가 안전한지 판단할 수는 없습니다. 결과를 백엔드로 보내 검증하고 보호할 작업을 허용할지 결정하세요.
:::

| 작업 | 담당 |
| --- | --- |
| 기기에서 토큰 / attestation / assertion 발급 | **라이브러리** |
| `clientDataHash`(SHA-256) 계산과 클라이언트 데이터 구성 | 앱 |
| 토큰을 백엔드로 전송 | 앱 |
| 복호화 / 서명 검증 / 판정 해석 | **서버** |
| App Attest `keyId` 저장 | 앱(라이브러리는 `keyId`를 저장하지 않음) |
| Google Cloud / Apple 콘솔 설정 | 개발자 |

## 설치 {#installation}

```bash
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

패키지의 네이티브 최소 버전은 iOS 14.0 이상과 Android API 24 이상입니다. Nitro와 React Native 의존성에 따라 높아질 수 있습니다. Play Integrity에는 Google Play Services가 필요합니다. DeviceCheck는 iOS 11부터 있지만 이 패키지는 iOS 11 설치를 지원하지 않습니다.

## API 레퍼런스 {#api-reference}

```typescript
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();
```

### 사용 가능 여부 {#availability}

#### `isSupported` {#issupported}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
readonly isSupported: boolean
```

확인할 수 있는 범위에서 지원 여부를 반환합니다. Android에서는 Google Play Services를 사용할 수 있으면 `true`를 반환합니다. 이 값이 앱의 Play Integrity API 설정 완료를 **보장하지는 않습니다**. iOS에서는 `DCAppAttestService.shared.isSupported`를 사용합니다. 시뮬레이터에서는 항상 `false`입니다.

#### `providerType` {#providertype}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
readonly providerType: 'playIntegrity' | 'appAttest' | 'unsupported'
```

기기에서 사용하는 provider를 나타냅니다. 플랫폼 전용 메서드를 호출하기 전에 이 값을 확인해 클라이언트 코드를 분기하세요.

---

### Android — Play Integrity {#android--play-integrity}

#### `prepareStandardProvider()` {#preparestandardprovider}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
prepareStandardProvider(cloudProjectNumber: string): Promise<void>
```

Play Integrity **Standard** 토큰 provider를 준비합니다. 네이티브에서 provider를 캐시하므로 세션마다 한 번 호출하세요. JavaScript 숫자 정밀도 손실을 막기 위해 `cloudProjectNumber`는 문자열로 전달합니다.

프로젝트 번호가 잘못되면 오류 메시지는 `CLOUD_PROJECT_NUMBER_IS_INVALID`로 시작합니다. SDK 오류는 `STANDARD_INTEGRITY_ERROR_<숫자 코드>`로 시작합니다. 예를 들어 네트워크 오류는 `STANDARD_INTEGRITY_ERROR_-3`입니다. iOS에서는 `UNSUPPORTED_PLATFORM`입니다.

#### `requestIntegrityToken()` {#requestintegritytoken}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
requestIntegrityToken(requestHash: string): Promise<string>
```

Standard 토큰을 요청합니다. 먼저 `prepareStandardProvider`를 호출해야 합니다. 캐시한 provider가 만료됐다면(`INTEGRITY_TOKEN_PROVIDER_INVALID`) 자동으로 한 번 다시 준비하고 요청을 재시도합니다.

`requestHash`는 요청의 핵심 매개변수를 SHA-256으로 해시한 base64 값입니다(최대 500바이트). 서버 nonce가 아니며 호출자가 계산합니다. 불투명한 암호화 토큰 문자열을 반환합니다.

#### `requestClassicIntegrityToken()` {#requestclassicintegritytoken}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
requestClassicIntegrityToken(nonce: string, cloudProjectNumber: string): Promise<string>
```

Play Integrity **Classic** 흐름입니다(일회성, 서버 nonce 기반). 자주 검사할 때는 Standard를 우선 사용하세요. `nonce`는 서버가 생성한 일회용 URL-safe base64 값이어야 하며 길이는 16–500바이트입니다.

---

### iOS — App Attest {#ios--app-attest}

#### `generateKey()` {#generatekey}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
generateKey(): Promise<string>
```

Secure Enclave에서 App Attest 키 쌍을 만들고 `keyId`를 반환합니다.

:::warning keyId를 직접 저장하세요
`keyId`는 이 키에 접근하는 유일한 핸들입니다. Keychain 등에 저장하세요. 라이브러리는 `keyId`를 저장하지 않습니다. App Attest 키는 **앱 재설치 후 유지되지 않습니다**. `DCError.invalidKey`가 발생하면 다시 생성하세요.
:::

#### `attestKey()` {#attestkey}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
attestKey(keyId: string, clientDataHash: string): Promise<string>
```

키 attestation을 수행하며 Apple에 네트워크 요청을 보냅니다(설치마다 키당 **한 번**). `clientDataHash`는 `SHA-256(server challenge)`의 base64 값이며, 해독한 길이가 정확히 **32바이트**여야 합니다. 라이브러리는 해시를 계산하지 않습니다. 잘못된 base64는 `INVALID_BASE64`, 해독한 길이가 다르면 `INVALID_INPUT`으로 reject됩니다. 이 검사는 iOS 기기 지원 여부보다 먼저 수행합니다. 불투명한 CBOR attestation 객체를 base64로 인코딩해 반환합니다.

#### `generateAssertion()` {#generateassertion}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
generateAssertion(keyId: string, clientDataHash: string): Promise<string>
```

후속 요청용 assertion을 오프라인으로 생성합니다. 요청마다 서버에서 새 일회용 challenge를 받아 요청 payload와 함께 구성한 client data를 해시하세요. 32바이트 SHA-256 해시를 base64로 전달하며, `attestKey`와 같은 입력 검사를 적용합니다. 불투명한 CBOR assertion 객체를 base64로 인코딩해 반환합니다. 서버는 발급한 challenge와 단조 증가 카운터를 확인해 재전송 공격을 탐지합니다.

---

### iOS — DeviceCheck {#ios--devicecheck}

#### `getDeviceCheckToken()` {#getdevicechecktoken}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
getDeviceCheckToken(): Promise<string>
```

Apple DeviceCheck 토큰을 생성합니다(기기 수준이며 App Attest보다 가벼움). 서버는 Apple DeviceCheck API로 기기의 2비트 상태를 조회·갱신합니다.

## 오류 {#errors}

reject 시 `Error.message` 앞부분에 오류 코드를 포함합니다. JavaScript `error.code` 속성은 별도로 보장하지 않습니다.

| 메시지 앞부분 | 의미 |
| --- | --- |
| `UNSUPPORTED_PLATFORM` | 다른 플랫폼 전용 메서드를 호출했거나 iOS 하드웨어가 지원하지 않음. |
| `CLOUD_PROJECT_NUMBER_IS_INVALID` | 프로젝트 번호가 양의 부호 있는 64비트 정수 문자열이 아님. |
| `PROVIDER_NOT_PREPARED` | Standard 토큰 요청 전에 `prepareStandardProvider`를 호출해야 함. |
| `STANDARD_INTEGRITY_ERROR_<숫자 코드>` | Standard SDK 오류. Provider 무효화(`-19`)는 한 번 새로 준비하고 재시도하며, 다른 오류는 그대로 반환함. |
| `CLASSIC_INTEGRITY_ERROR_<숫자 코드>` | Classic SDK 오류. 자동 재시도하지 않음. |
| `INVALID_BASE64` | iOS `clientDataHash`가 올바른 base64가 아님. |
| `INVALID_INPUT` | 해독한 iOS 해시가 32바이트가 아니거나 Apple이 잘못된 입력으로 처리함. |
| `INVALID_KEY`, `SERVER_UNAVAILABLE`, `FEATURE_UNSUPPORTED`, `UNKNOWN_SYSTEM_FAILURE`, `UNKNOWN` | Apple DeviceCheck / App Attest 오류를 변환한 코드. 다른 네이티브 오류는 원래 메시지를 유지함. |

SDK 숫자 코드를 `NETWORK_ERROR` 같은 이름으로 변환하지 않고 유지합니다. [Standard SDK 오류 코드](https://developer.android.com/google/play/integrity/reference/com/google/android/play/core/integrity/model/StandardIntegrityErrorCode)를 참고하세요. reject를 처리하고 이를 신뢰할 수 있는 판정으로 간주하지 마세요.

## 사용법 {#usage}

```typescript
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

if (integrity.providerType === 'playIntegrity') {
  // Android
  await integrity.prepareStandardProvider('123456789012'); // once
  const requestHash = base64Sha256('checkout:item-42');    // your request params
  const token = await integrity.requestIntegrityToken(requestHash);
  await postToYourServer({ token });                        // server verifies
} else if (integrity.providerType === 'appAttest') {
  // iOS
  const keyId = await integrity.generateKey();              // persist this
  const clientDataHash = base64Sha256(serverChallenge);
  const attestation = await integrity.attestKey(keyId, clientDataHash); // once
  await postToYourServer({ keyId, attestation });           // one-time validation
  // ...per request:
  const challenge = await fetchChallengeFromYourServer(); // fresh, one-time
  const clientData = JSON.stringify({ challenge, payload });
  const assertion = await integrity.generateAssertion(keyId, base64Sha256(clientData));
  await postToYourServer({ keyId, assertion, clientData });
}
```

예제의 해시 함수와 백엔드 통신 함수는 앱에서 구현해야 합니다. 해시한 `clientData` 문자열을 그대로 보내세요. 서버는 같은 바이트로 서명을 검증하고 문자열에 포함된 challenge가 해당 요청에 발급한 값과 일치하는지 확인해야 합니다.

## 서버 검증(개발자 책임) {#server-verification-your-responsibility}

이 라이브러리는 토큰 발급까지만 담당합니다. 백엔드에서 검증하세요.

### Play Integrity(Android) {#play-integrity-android}

서버로 토큰을 보낸 뒤 Google의 decode 엔드포인트를 호출하세요(권장).

```http
POST https://playintegrity.googleapis.com/v1/{packageName}:decodeIntegrityToken
```

판정을 확인하기 전에 `requestDetails`를 검증하세요. `requestPackageName`이 예상한 앱과 일치하고 `timestampMillis`가 허용한 유효 기간 안에 있어야 합니다. Standard는 보호할 요청으로 계산한 `requestHash`와, Classic은 서버가 발급한 미사용 `nonce`와 일치하는지 확인하세요. 불일치하거나 만료된 요청은 백엔드에서 거부합니다.

그다음 응답의 판정 값에 서비스 정책을 적용하세요.

- `deviceIntegrity.deviceRecognitionVerdict`에 `MEETS_DEVICE_INTEGRITY` 포함 여부
- `appIntegrity.appRecognitionVerdict === 'PLAY_RECOGNIZED'`
- `deviceRecognitionVerdict`가 비어 있거나 없으면 판정 기준을 충족하지 못한 것입니다. API hooking, 시스템 침해, Google의 검사를 통과하지 못한 에뮬레이터 등이 원인일 수 있습니다.

[Play Integrity 판정](https://developer.android.com/google/play/integrity/verdicts)을 참고하세요.

### App Attest(iOS) {#app-attest-ios}

1. 키마다 한 번 Apple App Attest Root CA를 기준으로 **attestation**을 검증하세요(인증서 체인, nonce, app-ID 해시, counter = 0). 공개 키와 카운터를 저장하세요.
2. 각 **assertion**을 받으면 client data를 그대로 해시해 저장한 공개 키로 서명을 검증하세요. client data의 challenge가 서버에서 발급한 미사용 값과 일치하는지, 카운터가 이전 값보다 커졌는지 확인하세요.

[서버에 연결하는 앱 검증](https://developer.apple.com/documentation/devicecheck/validating-apps-that-connect-to-your-server)을 참고하세요.

## 필요한 설정 {#setup-requirements}

### Android(Play Integrity) {#android-play-integrity}

1. **Google Cloud** 프로젝트를 만들거나 선택하고 Play Integrity API를 켜세요.
2. **Play Console** → *Play Integrity API*에서 연결하세요.
3. **Cloud 프로젝트 번호**를 `prepareStandardProvider` / `requestClassicIntegrityToken`에 전달하세요.
4. 서버에서 Google 서비스 계정 또는 응답 암호화 키를 설정하세요.

### iOS(App Attest / DeviceCheck) {#ios-app-attest--devicecheck}

1. 앱 타깃에 **App Attest** 기능을 추가하세요(Xcode → Signing & Capabilities). `com.apple.developer.devicecheck.appattest-environment` entitlement를 추가합니다.
2. **소유한 번들 식별자**를 사용하고 Development Team을 설정하세요.
3. DeviceCheck 서버 조회용 `.p8` 키를 Apple Developer 포털에서 만드세요.

:::info 개발자 계정과 앱 타깃 설정이 필요합니다
위 항목은 개발자 계정과 앱 타깃에서 관리합니다. 라이브러리가 대신 설정할 수는 없습니다. 앱 설정을 마친 뒤 토큰을 발급합니다.
:::

## 제한 사항 {#limitations}

:::warning Device attestation의 범위와 한계

- **App Attest는 탈옥 탐지기가 아닙니다.** 실제 Apple 하드웨어에서 변조하지 않은 정식 앱이 실행 중임을 증명합니다. 긍정적인 신호로 사용하세요.
- **지원 여부와 판정은 다릅니다.** iOS 시뮬레이터에서 `isSupported`는 `false`입니다. Android의 Google Play Services 사용 가능 여부는 토큰 발급 성공이나 특정 무결성 판정을 보장하지 않습니다. 서버에서 [Play Integrity 판정](https://developer.android.com/google/play/integrity/verdicts)을 확인하세요.
- **우회 방법이 존재합니다**(PlayIntegrityFix 등). device attestation은 더 넓은 부정 사용 방지 전략의 한 신호이며 절대적인 보장이 아닙니다.
- **네트워크와 콘솔 설정이 필요합니다.** 없으면 토큰 발급 요청이 reject됩니다. reject를 처리하고 기기가 안전하다고 간주하지 마세요.
- **App Attest 호출 제한**: Apple은 `attestKey` 호출 빈도를 제한합니다. 앱에서 빈도를 제어하세요. App Attest 호출에는 라이브러리가 자동 재시도나 타이머를 추가하지 않습니다.

:::
