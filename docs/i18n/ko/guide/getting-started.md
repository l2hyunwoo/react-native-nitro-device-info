# 시작하기

이 가이드는 React Native 프로젝트에 `react-native-nitro-device-info`를 설치하고 구성하는 데 도움을 줍니다.

## 전제 조건

설치하기 전에 프로젝트가 다음 요구 사항을 충족하는지 확인하세요:

- **React Native**: 0.68 이상 (새로운 아키텍처 지원)
- **iOS**: 배포 대상 13.4 이상
- **Android**: minSdkVersion 24 이상 (Android 7.0 Nougat)
- **Node.js**: 16 이상

## 설치

선호하는 패키지 관리자를 사용하여 라이브러리와 피어 의존성을 설치합니다:

```bash
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **중요**: JSI 바인딩을 위해 `react-native-nitro-modules` ^0.31.0이 피어 의존성으로 필요합니다.

## 플랫폼 설정

### iOS 구성

설치 후 CocoaPods 의존성을 설치합니다:

```sh
cd ios && pod install && cd ..
```

그게 전부입니다! iOS 설정이 완료되었습니다.

### Android 구성

추가 구성이 필요 없습니다! Gradle 자동 링킹이 모든 것을 자동으로 처리합니다.

Android 앱을 빌드할 때 라이브러리가 자동으로 링크됩니다.

## 설치 확인

설치가 성공적으로 완료되었는지 확인하려면 앱에 다음 코드를 추가하세요:

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

console.log('Device ID:', DeviceInfoModule.deviceId);
console.log('Brand:', DeviceInfoModule.brand);
console.log('System Version:', DeviceInfoModule.systemVersion);
```

콘솔에 기기 정보가 로그되면 설치가 성공한 것입니다!

## 다음 단계

이제 라이브러리가 설치되었으므로 [빠른 시작](/guide/quick-start) 가이드를 확인하여 앱에서 사용하는 방법을 배우세요.

다음도 확인할 수 있습니다:
- 사용 가능한 모든 메서드는 [API 레퍼런스](/api/)에서 확인
- 일반적인 사용 사례는 [예제](/examples/basic-usage)에서 확인
- `react-native-device-info`에서 전환하는 경우 [마이그레이션 가이드](/api/migration) 확인
