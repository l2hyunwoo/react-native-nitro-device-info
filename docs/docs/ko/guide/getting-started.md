---
translationOf: guide/getting-started.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 시작하기 {#getting-started}

React Native 프로젝트에 `react-native-nitro-device-info`를 설치하고 설정합니다.

## 사전 요구 사항 {#prerequisites}

설치 전에 프로젝트가 다음 조건을 충족하는지 확인하세요.

- **React Native**: 설치한 Nitro 런타임이 지원하는 버전을 사용하세요. 레포지터리 예제는 React Native 0.85.3을 사용하며, 이 값이 최소 지원 버전을 뜻하지는 않습니다.
- **iOS**: 배포 대상 15.1 이상
- **Android**: minSdkVersion 24 이상(Android 7.0 Nougat)
- **Node.js**: React Native toolchain 요구 사항을 따르세요. 레포지터리 개발에는 Node.js 22를 사용합니다.

위 iOS와 Android 최소 버전은 이 라이브러리의 네이티브 빌드에 설정한 값입니다. React Native나 Nitro는 더 높은 최소 버전을 요구할 수 있습니다.

## 설치 {#installation}

원하는 패키지 관리자로 라이브러리와 peer dependencies를 설치하세요.

```bash
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **필수**: JSI 바인딩에 필요한 peer dependencies는 `react-native-nitro-modules` >=0.35.0 <1.0.0입니다.

## 플랫폼 설정 {#platform-setup}

### iOS 설정 {#ios-configuration}

패키지를 설치한 뒤 CocoaPods 의존성을 설치하세요.

```sh
cd ios && pod install && cd ..
```

Pod 설치 후 iOS 앱을 다시 빌드하세요. Metro만 재시작하면 네이티브 코드가 설치되지 않습니다.

### iOS privacy info manifest {#ios-privacy-manifest}

Pod는 `ios/PrivacyInfo.xcprivacy`를 `NitroDeviceInfo_privacy.bundle`에 포함합니다. CocoaPods는 이 리소스 번들을 앱에 복사합니다. Expo prebuild나 EAS Build에서 Pod를 설치할 때도 같습니다. 개인정보 보호 전용 config plugin 옵션을 켜거나 앱 타깃에 직접 복사할 필요는 없습니다.

privacy info manifest는 [Expo Device](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-device/ios/ExpoDevice.podspec#L23)와 같은 리소스 번들 방식으로 포함하며 이 라이브러리가 사용하는 API에 맞춰 `approved reason`(Apple이 허용한 API 사용 목적)을 선언했습니다.

| API 범주 | 라이브러리 API | 선언한 approved reason |
| --- | --- | --- |
| 파일 타임스탬프 | `getFirstInstallTime()`과 `getLastUpdateTime()`은 앱 컨테이너 안의 메타데이터를 읽습니다. `firstInstallTimeSync`는 처음 접근할 때 메타데이터를 읽고 이후 캐시를 반환합니다. `lastUpdateTimeSync`는 iOS에서 `-1`을 반환합니다. | `C617.1`. [Expo Application](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-application/ios/PrivacyInfo.xcprivacy)도 사용합니다. |
| 디스크 공간 | `totalDiskCapacity`, `getFreeDiskStorage()` 및 레거시 API | `E174.1`, `85F4.1`. [Expo FileSystem](https://github.com/expo/expo/blob/5729befbfdb34e4be8880c19b3c5eff99bd04795/packages/expo-file-system/ios/PrivacyInfo.xcprivacy)도 사용합니다. |
| 시스템 부팅 시각 | `getUptime()`은 앱 이벤트 사이의 경과 시간이나 타이머에, `startupTime`은 앱 이벤트의 uptime을 절대 타임스탬프로 변환하는 데 사용합니다. | `35F9.1`: 경과 시간·타이머. `8FFB.1`: 앱 이벤트 타임스탬프. |

각 `approved reason`에는 [Apple이 정한 사용 제한](https://developer.apple.com/documentation/bundleresources/describing-use-of-required-reason-api)이 적용됩니다. 디스크 공간 데이터는 사용자에게 저장 공간을 보여 주거나 저장 공간에 따라 앱을 동작시키는 데 사용하며, 기기 밖으로 전송하는 데 제한이 있습니다.

iOS에서 `getUptime()`과 `startupTime`은 표에 적힌 앱 이벤트 시간 측정 목적으로만 사용해야 합니다. 원시 기기 가동 시간과 부팅 타임스탬프를 일반 기기 정보로 표시·수집하거나 기기 밖으로 전송하거나 핑거프린팅에 사용하면 안 됩니다. `35F9.1`에서는 앱 내 이벤트 사이의 경과 시간만 기기 밖으로 전송할 수 있습니다. `8FFB.1`에서는 앱 내 이벤트를 변환한 절대 타임스탬프만 기기 밖으로 전송할 수 있습니다. [시간 측정 API 예제](../api/device-info.md#getuptime-number)를 참고하세요. Expo Device도 `35F9.1`을 선언하지만, 이 선언이 더 넓은 용도를 허용하지는 않습니다.

라이브러리 자체는 데이터 수집이나 추적을 선언하지 않습니다. 앱의 데이터 수집·추적과 다른 SDK에 필요한 선언은 앱에서 관리해야 합니다. 이 API를 기기 핑거프린팅에 사용하지 마세요.

iOS 앱을 빌드하거나 아카이브한 뒤 `NitroDeviceInfo_privacy.bundle/PrivacyInfo.xcprivacy`가 앱에 포함됐는지 확인하세요. 기존 앱 수준의 privacy info manifest는 그대로 둘 수 있습니다.

### Android 설정 {#android-configuration}

Android 앱을 다시 빌드하면 Gradle의 autolinking으로 라이브러리를 등록합니다. 권한이 필요한 API에는 추가 설정이 필요할 수 있습니다. [Expo 설정](/guide/expo-setup)을 참고하세요.

### Expo 앱 {#expo-apps}

개발 빌드 또는 EAS Build를 사용하세요. Expo Go에는 이 네이티브 모듈이 없습니다. 설치, 네이티브 설정, 재빌드 절차는 [Expo 설정](/guide/expo-setup)을 따르세요.

## 설치 확인 {#verify-installation}

앱에 다음 코드를 추가하세요.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

console.log('Device ID:', DeviceInfoModule.deviceId);
console.log('Brand:', DeviceInfoModule.brand);
console.log('System Version:', DeviceInfoModule.systemVersion);
```

콘솔에 기기 정보가 출력되면 설치가 완료된 것입니다.

## 다음 단계 {#next-steps}

앱에서 API를 사용하는 방법은 [빠른 시작](/guide/quick-start)에서 확인하세요.

- [API 레퍼런스](/api/): 사용 가능한 전체 API
- [예제](/examples/basic-usage): 자주 쓰는 활용 방법
- [마이그레이션 가이드](/api/migration): `react-native-device-info`에서 전환하는 방법
