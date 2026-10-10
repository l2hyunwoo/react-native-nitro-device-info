# Integrity Demo 앱

[English](README.md) | **한국어**

선택적으로 설치하는 하드웨어 기반 device attestation 패키지 [`react-native-nitro-device-integrity`](../../packages/react-native-nitro-device-integrity/README-ko.md)의 예제입니다. Android는 Play Integrity, iOS는 App Attest + DeviceCheck를 사용합니다.

앱은 device attestation 토큰을 **발급**하고 일부를 화면에 표시합니다. 발급한 토큰은 서버에서 검증해야 합니다. [API 문서](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/device-attestation#server-verification-your-responsibility)의 서버 검증 안내를 참고하세요.

## 표시하는 기능

- 현재 기기의 `providerType` / `isSupported`
- **Android**: Cloud 프로젝트 번호 입력 → _Prepare provider_ → _Request integrity token_(Play Integrity Standard)
- **iOS**: _Generate key_ → _Attest key_ → _Generate assertion_(App Attest), 별도 _DeviceCheck token_ 버튼
- 기기나 설정이 지원 조건을 충족하지 않을 때의 오류(iOS 시뮬레이터 등)

`clientDataHash` / `requestHash`는 자체 SHA-256 구현(`src/utils/hash.ts`)으로 앱 안에서 계산합니다. 네이티브 암호화 의존성은 없습니다.

## 앱 실행

레포지터리 루트에서:

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

패키지의 `.nitro.ts` API를 바꾸면 레포지터리 루트에서 `yarn nitrogen:integrity`를 실행하세요.

## 실제 토큰에 필요한 설정

provider를 설정해야 실제 토큰을 받을 수 있습니다. 설정하지 않은 채 버튼을 누르면 요청이 실패하고 원인을 설명하는 오류가 표시됩니다.

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

## 기기 테스트

[기여 안내](../../CONTRIBUTING-ko.md#integrity-테스트)에 따라 workspace 의존성을 설치하고 integrity 패키지를 준비하세요.

1. [rn-harness.config.mjs](rn-harness.config.mjs)에서 사용할 수 있는 시뮬레이터나 연결한 Android 기기를 선택하세요. 설정한 iOS 런타임이 설치되어 있어야 합니다. 버전은 `INTEGRITY_IOS_VERSION`으로 바꿀 수 있습니다.
2. 같은 기기에 **Debug** 데모 앱을 설치하세요. iOS는 `<configured simulator name>`을 설정 파일의 시뮬레이터 이름으로 바꿉니다.

   ```sh
   yarn integrity-demo ios --mode Debug --simulator "<configured simulator name>" --no-packager
   ```

   Android는 설정 파일에서 연결한 기기를 선택하고 `yarn integrity-demo android --no-packager`로 Debug 앱을 설치하세요.

3. 레포지터리 루트에서 해당 플랫폼의 하네스를 실행하세요.

   ```sh
   yarn integrity-demo test:e2e:ios
   # Or, with the configured Android device connected:
   yarn integrity-demo test:e2e:android
   ```

하네스가 Metro를 시작합니다. Release 앱은 번들에 포함된 JavaScript를 사용하므로 이 테스트를 불러올 수 없습니다. 지원 여부, 잘못된 해시 입력, JavaScript 브리지를 거치는 네이티브 promise reject를 검사합니다. 시뮬레이터 결과는 클라이언트 동작을 확인하며 실기기의 attestation과 백엔드 검증은 별도로 확인해야 합니다.

## 실제 서비스에 적용하기

데모는 고정된 테스트 challenge를 사용하고 토큰을 검증하지 않습니다. 실제 앱은 서버에서 새로운 일회용 challenge를 받고 보호할 작업을 허용하기 전에 발급 결과를 검증해야 합니다. [Attestation API와 서버 검증 안내](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/device-attestation#server-verification-your-responsibility)를 참고하세요.
