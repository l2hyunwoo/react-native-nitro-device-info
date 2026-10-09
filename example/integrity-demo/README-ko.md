# Integrity Demo 앱

[English](README.md) | **한국어**

선택적 하드웨어 기반 기기 증명 패키지 [`react-native-nitro-device-integrity`](../../packages/react-native-nitro-device-integrity/README-ko.md)의 예제입니다. Android는 Play Integrity, iOS는 App Attest + DeviceCheck를 사용합니다.

앱은 기기 증명 토큰을 **발급**하고 일부를 화면에 표시합니다. 검증은 서버의 책임입니다. [패키지 README](../../packages/react-native-nitro-device-integrity/README-ko.md)의 서버 검증 안내를 참고하세요.

## 표시하는 기능

- 현재 기기의 `providerType` / `isSupported`
- **Android**: Cloud 프로젝트 번호 입력 → *Prepare provider* → *Request integrity token*(Play Integrity Standard)
- **iOS**: *Generate key* → *Attest key* → *Generate assertion*(App Attest), 별도 *DeviceCheck token* 버튼
- iOS 시뮬레이터처럼 기기나 설정을 지원하지 않을 때의 오류

`clientDataHash` / `requestHash`는 자체 SHA-256 구현(`src/utils/hash.ts`)으로 앱 안에서 계산합니다. 네이티브 암호화 의존성은 없습니다.

## 앱 실행

저장소 루트에서:

```bash
yarn integrity-demo ios      # iOS (real device required for App Attest)
yarn integrity-demo android  # Android (needs Google Play Services)
```

이 디렉터리에서:

```bash
yarn pod    # iOS: pod install
yarn ios
yarn android
```

패키지의 `.nitro.ts` API를 바꾸면 저장소 루트에서 `yarn nitrogen:integrity`를 실행하세요.

## 실제 토큰에 필요한 설정

제공자를 설정해야 실제 토큰을 반환합니다. 설정하지 않으면 버튼이 설명이 있는 오류로 거부됩니다.

### iOS(App Attest)

- `ios/NitroDeviceIntegrityDemo.xcworkspace`를 열고 타깃 → *Signing & Capabilities*를 선택하세요.
- **Development Team**과 **소유한 번들 식별자**를 설정하세요. App Attest는 임시 번들 ID로 동작하지 않습니다.
- **App Attest** 기능은 `NitroDeviceIntegrityDemo.entitlements`에 미리 설정되어 있습니다(`com.apple.developer.devicecheck.appattest-environment = development`).
- **실제 기기**에서 실행하세요. 시뮬레이터는 App Attest를 지원하지 않습니다.

### Android(Play Integrity)

- **Google Cloud** 프로젝트를 만들거나 선택하고 Play Integrity API를 켜세요.
- **Play Console** → *Play Integrity API*에서 연결하세요.
- 앱 입력란에 **Cloud 프로젝트 번호**를 입력하세요.
- **Google Play Services**가 있는 기기에서 실행하세요(대부분의 실기기 또는 Play Store가 있는 에뮬레이터).

## 포함하지 않는 기능

서버 토큰 검증은 포함하지 않습니다. 이 예제는 발급까지만 담당하며 복호화·검증은 백엔드에서 합니다. 방법은 패키지 README를 참고하세요.
