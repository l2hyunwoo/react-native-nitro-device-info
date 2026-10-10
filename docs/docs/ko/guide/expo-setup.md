---
translationOf: guide/expo-setup.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# Expo 설정 {#expo-setup}

Expo 프로젝트에서 [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/)(`expo prebuild` / 개발 클라이언트)을 사용한다면 **config plugin**으로 `react-native-nitro-device-info`를 설정할 수 있습니다. `ios/`나 `android/`를 직접 편집하지 않아도 됩니다.

[Expo 개발 빌드](https://docs.expo.dev/develop/development-builds/introduction/) 또는 EAS Build를 사용하세요. Expo Go에는 이 네이티브 모듈이 없습니다. Expo SDK와 호환되는 React Native 및 Nitro 버전을 선택하세요.

## 설치 {#install}

```bash
npx expo install react-native-nitro-device-info react-native-nitro-modules
```

네이티브 모듈은 autolinking으로 등록됩니다. 대부분의 API는 이 과정만으로 사용할 수 있으므로 `plugins` 배열에 plugin을 추가하지 않고 `npx expo prebuild`를 실행할 수 있습니다.

## config plugin이 필요한 경우 {#when-you-need-the-config-plugin}

일부 API가 사용하는 네이티브 기능에는 권한이나 entitlement가 필요합니다. 이 설정은 **선택 사항**이며 plugin은 요청한 항목만 추가합니다. 사용하지 않는 권한을 요청하면 앱 스토어 심사에서 거절될 수 있습니다. `app.json` 또는 `app.config.js`의 `plugins` 배열에 추가하고 필요한 옵션을 켜세요.

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-nitro-device-info",
        {
          "enableSerialNumber": true
        }
      ]
    ]
  }
}
```

Expo가 네이티브 디렉터리를 관리한다면 plugin 옵션을 바꾼 뒤 네이티브 디렉터리를 다시 생성하세요. `--clean`은 `ios/`와 `android/`를 삭제하고 다시 만듭니다. 직접 수정한 네이티브 코드는 실행 전에 따로 보관하세요.

```bash
npx expo prebuild --clean
```

prebuild 후 `npx expo run:ios`, `npx expo run:android` 또는 EAS Build로 네이티브 앱을 다시 빌드하고 설치하세요. JavaScript 서버만 재시작하면 네이티브 변경이 적용되지 않습니다.

### Plugin 옵션 {#plugin-options}

| 옵션 | 기본값 | 효과 |
| --- | --- | --- |
| `enableSerialNumber` | `false` | Android `READ_PHONE_STATE`를 선언합니다. 앱에서 런타임 권한을 별도로 요청해야 합니다. Android 10 이상은 일련번호 접근을 추가로 제한하므로 일반 앱은 권한을 받아도 대개 `"unknown"`을 받습니다. |

Plugin은 권한을 선언할 뿐 런타임에 요청하거나 [Android 일련번호 제한](https://developer.android.com/reference/android/os/Build#getSerial())을 우회하지 않습니다. 라이브러리는 처음 접근할 때 `serialNumber`를 캐시하므로 필요한 권한은 읽기 전에 요청하세요.

### 자동으로 추가하지 않는 설정 {#what-is-not-injected-by-design}

- **`getInstallReferrer()`, `getHasGms()`**: Play Install Referrer와 Google Play Services 의존성은 라이브러리의 Gradle 빌드에 포함됩니다. 사용하는 앱에서 매니페스트나 Gradle을 바꿀 필요가 없습니다.
- **위치 및 통신사 API**: `getIsLocationEnabled()`와 통신사 getter는 권한을 요청하지 않고 전역 시스템 상태를 읽습니다. `Info.plist`의 용도 설명 키가 필요하지 않습니다.
- **`isSideLoadingEnabled()`**: 아래를 참고하세요.

## `isSideLoadingEnabled()`의 수동 설정 {#issideloadingenabled-requires-manual-setup}

`isSideLoadingEnabled()`는 `canRequestPackageInstalls()`를 호출합니다. 앱이 Android `REQUEST_INSTALL_PACKAGES` 권한을 선언해야 `true`를 반환할 수 있습니다. Google Play는 이 권한을 제한 권한으로 분류하므로 plugin은 이 권한을 추가하지 않습니다. 사용자가 직접 시작한 설치 과정에서 실제로 패키지를 설치하는 앱에만 허용됩니다. 사이드로딩 상태 조회만을 위해 선언하면 Play 심사에서 거절될 수 있습니다.

앱이 사용 요건을 충족한다면 [`expo-build-properties`](https://docs.expo.dev/versions/latest/sdk/build-properties/) plugin이나 작은 커스텀 plugin으로 권한을 추가하고 Play Console 권한 신고에서 용도를 설명하세요. 권한이 없으면 `isSideLoadingEnabled()`는 `false`를 반환합니다.

## Device attestation(App Attest / Play Integrity) {#device-attestation-app-attest--play-integrity}

서버에서 검증할 device attestation 토큰을 발급하는 선택 패키지 `react-native-nitro-device-integrity`에는 별도의 config plugin이 있습니다.

```bash
npx expo install react-native-nitro-device-integrity
```

```json
{
  "expo": {
    "plugins": [
      [
        "react-native-nitro-device-integrity",
        {
          "appAttest": true
        }
      ]
    ]
  }
}
```

| 옵션 | 기본값 | 효과 |
| --- | --- | --- |
| `appAttest` | `false` | iOS `com.apple.developer.devicecheck.appattest-environment` entitlement를 `development` 값으로 추가해 `DCAppAttestService`를 사용할 수 있게 합니다. |

Entitlement 값은 항상 `development`로 기록합니다. TestFlight나 App Store로 배포하는 빌드는 iOS가 이 값을 무시하고 자동으로 프로덕션 환경을 사용하므로 두 환경에서 같은 값을 사용할 수 있습니다.

:::warning Apple Developer 포털의 App Attest 기능도 필요합니다
Plugin은 entitlement를 기록하지만 App ID에서 App Attest 기능을 켤 수는 없습니다. Apple Developer 포털에서 App ID의 **App Attest**를 켜거나 EAS / Xcode 자동 서명으로 관리하세요. 기능이 없으면 빌드 서명이 실패합니다(오류 `0xE8008016`).
:::

Play Integrity(Android)와 DeviceCheck(iOS)는 entitlement나 권한이 필요하지 않습니다. Play Integrity의 런타임 `cloudProjectNumber`만 필요하므로 config plugin을 요구하지 않습니다.

## 결과 확인 {#verifying-the-result}

`npx expo prebuild --clean` 후 추가한 설정을 확인하세요.

- `enableSerialNumber`를 켰다면 `android/app/src/main/AndroidManifest.xml`에 `<uses-permission android:name="android.permission.READ_PHONE_STATE" />`가 있어야 합니다.
- `appAttest`를 켰다면 `ios/<app>/<app>.entitlements`에 `appattest-environment` 키가 있어야 합니다.

Plugin은 멱등성을 유지하므로 prebuild를 다시 실행해도 항목이 중복되지 않습니다.
