---
translationOf: api/device-attestation.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# Device attestation API {#device-attestation-api}

선택 패키지 `react-native-nitro-device-integrity`는 하드웨어 기반 **device attestation** 토큰을 발급합니다. 기기가 보낸 토큰은 서버에서 검증해야 합니다.

<span class="rp-badge rp-badge--warning">미배포</span>

이 패키지는 소스 레포지터리에 있지만 2026-10-10 기준 npm에 배포하지 않았습니다. 매니페스트의 `0.1.0`은 릴리스가 아닙니다. npm 설치 명령은 배포 후에 적용됩니다.

[지원 여부 배지 설명](/api/#availability-badges)을 읽으세요. Pod의 대상은 iOS 14 이상, Android 모듈의 대상은 API 24 이상입니다. 의존성은 더 높은 최소 버전을 요구할 수 있습니다. 웹용 entry point는 없습니다.

- **Android** → [Play Integrity API](https://developer.android.com/google/play/integrity)
- **iOS** → [App Attest(`DCAppAttestService`)](https://developer.apple.com/documentation/devicecheck/dcappattestservice) + [DeviceCheck(`DCDevice`)](https://developer.apple.com/documentation/devicecheck/dcdevice)

핵심 라이브러리와 **별개의 선택 패키지**이므로 device attestation이 필요할 때만 설치하세요. 설치하면 Play Integrity / App Attest 의존성이 추가됩니다. Google Cloud / Apple 콘솔 설정도 필요합니다.

:::tip Device attestation과 로컬 탐지
이 API는 핵심 [기기 무결성 API](./device-integrity)를 **보완**합니다.

- **로컬 탐지**([`isDeviceCompromised()`](./device-integrity)): 빠르고 오프라인에서 동작하지만 쉽게 우회할 수 있습니다. 첫 단계 사전 필터로 사용합니다.
- **device attestation**(이 페이지): 네트워크를 사용하고 **서버에서 검증**하는 강한 판단 근거입니다.

로컬 검사는 빠른 사전 필터로, device attestation은 서버가 신뢰 여부를 판단하는 기준으로 사용하세요.
:::

## 토큰 발급과 검증은 누가 담당하나요? {#the-responsibility-boundary}

:::warning 라이브러리는 토큰만 발급합니다. 검증은 서버에서 해야 합니다
모든 메서드는 **불투명한 토큰**을 반환합니다. 라이브러리는 토큰 내용을 해석할 수 없으며 기기가 안전한지 불리언으로 반환하지 않습니다. **서버**에서 판단해야 하므로 토큰을 백엔드로 보내 검증하세요.
:::

| 작업 | 담당 |
| --- | --- |
| 기기에서 토큰 / attestation / assertion 발급 | **라이브러리** |
| `clientDataHash`(SHA-256) 계산과 클라이언트 데이터 구성 | 앱 |
| 토큰을 백엔드로 전송 | 앱 |
| 복호화 / 서명 검증 / 판정 해석 | **서버** |
| App Attest `keyId` 저장 | 앱(라이브러리는 상태를 보관하지 않음) |
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

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
readonly isSupported: boolean
```

확인할 수 있는 범위에서 지원 여부를 반환합니다. Android에서는 Google Play Services를 사용할 수 있으면 `true`를 반환합니다. 이 값이 앱의 Play Integrity API 설정 완료를 **보장하지는 않습니다**. iOS에서는 `DCAppAttestService.shared.isSupported`를 사용합니다. 시뮬레이터에서는 항상 `false`입니다.

#### `providerType` {#providertype}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
readonly providerType: 'playIntegrity' | 'appAttest' | 'unsupported'
```

기기에서 사용하는 provider를 나타냅니다. 플랫폼 전용 메서드를 호출하기 전에 이 값을 확인해 클라이언트 코드를 분기하세요.

---

### Android — Play Integrity {#android--play-integrity}

#### `prepareStandardProvider()` {#preparestandardprovider}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
prepareStandardProvider(cloudProjectNumber: string): Promise<void>
```

Play Integrity **Standard** 토큰 provider를 준비합니다. 네이티브에서 provider를 캐시하므로 세션마다 한 번 호출하세요. JavaScript 숫자 정밀도 손실을 막기 위해 `cloudProjectNumber`는 문자열로 전달합니다.

**reject 시 오류 메시지**: `CLOUD_PROJECT_NUMBER_IS_INVALID`, `PLAY_STORE_NOT_FOUND`, `NETWORK_ERROR` 등. iOS에서는 `UNSUPPORTED_PLATFORM`입니다.

#### `requestIntegrityToken()` {#requestintegritytoken}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
requestIntegrityToken(requestHash: string): Promise<string>
```

Standard 토큰을 요청합니다. 먼저 `prepareStandardProvider`를 호출해야 합니다. 캐시한 provider가 만료됐다면(`INTEGRITY_TOKEN_PROVIDER_INVALID`) 자동으로 한 번 다시 준비하고 요청을 재시도합니다.

`requestHash`는 요청의 핵심 매개변수를 SHA-256으로 해시한 base64 값입니다(최대 500바이트). 서버 nonce가 아니며 호출자가 계산합니다. 불투명한 암호화 토큰 문자열을 반환합니다.

#### `requestClassicIntegrityToken()` {#requestclassicintegritytoken}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--warning">iOS: reject</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
requestClassicIntegrityToken(nonce: string, cloudProjectNumber: string): Promise<string>
```

Play Integrity **Classic** 흐름입니다(일회성, 서버 nonce 기반). 자주 검사할 때는 Standard를 우선 사용하세요. `nonce`는 서버가 생성한 일회용 URL-safe base64 값이어야 하며 길이는 16–500바이트입니다.

---

### iOS — App Attest {#ios--app-attest}

#### `generateKey()` {#generatekey}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
generateKey(): Promise<string>
```

Secure Enclave에서 App Attest 키 쌍을 만들고 `keyId`를 반환합니다.

:::warning keyId를 직접 저장하세요
`keyId`는 이 키에 접근하는 유일한 핸들입니다. Keychain 등에 저장하세요. 라이브러리는 상태를 보관하지 않습니다. App Attest 키는 **앱 재설치 후 유지되지 않습니다**. `DCError.invalidKey`가 발생하면 다시 생성하세요.
:::

#### `attestKey()` {#attestkey}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
attestKey(keyId: string, clientDataHash: string): Promise<string>
```

키 attestation을 수행하며 Apple에 네트워크 요청을 보냅니다(설치마다 키당 **한 번**). `clientDataHash`는 `SHA-256(server challenge)`의 base64 값입니다. 라이브러리는 해시를 계산하지 않습니다. 불투명한 CBOR attestation 객체를 base64로 인코딩해 반환합니다.

#### `generateAssertion()` {#generateassertion}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
generateAssertion(keyId: string, clientDataHash: string): Promise<string>
```

후속 요청용 assertion을 오프라인으로 생성합니다. 요청마다 서버에서 새 일회용 challenge를 받아 요청 payload와 함께 구성한 client data를 해시하세요. 불투명한 CBOR assertion 객체를 base64로 인코딩해 반환합니다. 서버는 발급한 challenge와 단조 증가 카운터를 확인해 재전송 공격을 탐지합니다.

---

### iOS — DeviceCheck {#ios--devicecheck}

#### `getDeviceCheckToken()` {#getdevicechecktoken}

<span class="rp-badge rp-badge--warning">미배포</span> <span class="rp-badge rp-badge--info">iOS 14+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: 미지원</span>

```typescript
getDeviceCheckToken(): Promise<string>
```

Apple DeviceCheck 토큰을 생성합니다(기기 수준이며 App Attest보다 가벼움). 서버는 Apple DeviceCheck API로 기기의 2비트 상태를 조회·갱신합니다.

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

응답에서 다음 판정 값을 확인하세요.

- `deviceIntegrity.deviceRecognitionVerdict`에 `MEETS_DEVICE_INTEGRITY` 포함 여부
- `appIntegrity.appRecognitionVerdict === 'PLAY_RECOGNIZED'`
- **빈** `deviceRecognitionVerdict`는 보안이 침해된 기기 또는 에뮬레이터를 나타내는 신호입니다.

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
- **시뮬레이터 / 에뮬레이터**: iOS 시뮬레이터에서 `isSupported`는 `false`입니다. Play Integrity는 에뮬레이터에서 약하거나 빈 판정을 반환합니다.
- **루팅 기기**: Play Integrity는 토큰을 반환하지만 `deviceRecognitionVerdict`가 비어 있습니다. 서버에서 실패로 처리해야 합니다.
- **우회 방법이 존재합니다**(PlayIntegrityFix 등). device attestation은 더 넓은 부정 사용 방지 전략의 한 신호이며 절대적인 보장이 아닙니다.
- **네트워크와 콘솔 설정이 필요합니다.** 없으면 토큰 발급 요청이 reject됩니다. reject를 처리하고 기기가 안전하다고 간주하지 마세요.
- **App Attest 호출 제한**: Apple은 `attestKey` 호출 빈도를 제한합니다. 앱에서 빈도를 제어하세요. 상태를 보관하지 않는 라이브러리는 재시도나 타이머를 추가하지 않습니다.
:::
