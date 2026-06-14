# Integrity 데모 앱

opt-in [`react-native-nitro-device-integrity`](../../packages/react-native-nitro-device-integrity)
패키지의 데모 앱입니다 — 하드웨어 기반 디바이스 attestation(Android의 Play
Integrity, iOS의 App Attest + DeviceCheck).

이 앱은 attestation 토큰을 **발급**해 화면에 표시(축약)합니다. 토큰을 **검증하지는
않습니다** — 검증은 여러분의 서버 책임입니다. 서버 검증 방법은
[패키지 README](../../packages/react-native-nitro-device-integrity/README.md)를 참고하세요.

## 무엇을 보여주나요

- 현재 디바이스의 `providerType` / `isSupported`
- **Android**: Cloud 프로젝트 번호 입력 → *Prepare provider* → *Request integrity
  token* (Play Integrity Standard)
- **iOS**: *Generate key* → *Attest key* → *Generate assertion* (App Attest),
  그리고 *DeviceCheck token* 버튼
- 미지원/미설정 환경(예: iOS 시뮬레이터)에서의 graceful 에러 처리

`clientDataHash` / `requestHash`는 앱 내에서 자체 SHA-256(`src/utils/hash.ts`)으로
계산합니다 — 네이티브 crypto 의존성이 없습니다.

## 앱 실행 방법

저장소 루트에서:

```bash
yarn integrity-demo ios      # iOS (App Attest는 실기기 필요)
yarn integrity-demo android  # Android (Google Play Services 필요)
```

이 디렉토리에서:

```bash
yarn pod    # iOS: pod install
yarn ios
yarn android
```

패키지의 `.nitro.ts` API를 변경한 뒤에는 저장소 루트에서 `yarn nitrogen:integrity`를
실행하세요.

## 실제 토큰 발급을 위한 설정

attestation은 provider가 설정된 경우에만 실제 토큰을 반환합니다. 설정 전에는 버튼이
설명이 담긴 에러로 reject됩니다(이것 자체도 확인할 가치가 있습니다).

### iOS (App Attest)

- `ios/NitroDeviceIntegrityDemo.xcworkspace`를 열고 타깃 → *Signing &
  Capabilities*로 이동
- **Development Team**과 **본인 소유의 bundle identifier**를 설정(App Attest는
  placeholder bundle ID로는 동작하지 않습니다)
- **App Attest** capability는 `NitroDeviceIntegrityDemo.entitlements`
  (`com.apple.developer.devicecheck.appattest-environment = development`)로
  미리 배선되어 있습니다
- **실기기**에서 실행 — App Attest는 시뮬레이터를 지원하지 않습니다

### Android (Play Integrity)

- **Google Cloud** 프로젝트를 만들고 Play Integrity API를 활성화
- **Play Console** → *Play Integrity API*에서 링크
- 해당 **Cloud 프로젝트 번호**를 앱 입력 필드에 입력
- **Google Play Services**가 있는 기기에서 실행(대부분의 실기기, Play Store가 있는
  에뮬레이터)

## 포함되지 않은 것 (의도적)

서버 측 토큰 검증. 이 데모는 토큰 발급까지만 다루며, 검증은 여러분의 백엔드가
수행합니다. 방법은 패키지 README를 참고하세요.
