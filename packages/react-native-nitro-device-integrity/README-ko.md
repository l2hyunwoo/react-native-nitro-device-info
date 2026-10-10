# react-native-nitro-device-integrity

[English](README.md) | **한국어**

[Nitro Modules](https://nitro.margelo.com/)로 React Native에서 device attestation을 사용합니다.

| 플랫폼  | API                               |
| ------- | --------------------------------- |
| Android | Play Integrity Standard와 Classic |
| iOS     | App Attest와 DeviceCheck          |

[`react-native-nitro-device-info`](https://github.com/l2hyunwoo/react-native-nitro-device-info)를 보완하는 선택 패키지입니다. 백엔드에서 검증할 토큰이 필요할 때 설치하세요. 핵심 기기 정보 라이브러리와 별도로 네이티브 의존성과 플랫폼 설정을 추가합니다.

> **보호할 작업을 허용하기 전에 백엔드에서 발급된 토큰·attestation·assertion을 검증해야 합니다.** 라이브러리는 네이티브 API를 제공하며 요청을 신뢰할지는 서버에서 판단합니다.

## 설치

```sh
yarn add react-native-nitro-device-integrity react-native-nitro-modules
cd ios && pod install
```

설치 후 네이티브 앱을 다시 빌드하세요. 패키지는 iOS 14.0 이상과 Android API 24 이상을 대상으로 하며 React Native와 Nitro 의존성은 더 높은 버전을 요구할 수 있습니다. 웹용 진입점은 없습니다.

- **Android:** Google Play Services와 Play Integrity를 설정한 Google Cloud 프로젝트가 필요합니다. Play Console에서 프로젝트를 연결하고 프로젝트 번호를 사용하세요.
- **iOS:** 앱 서명과 App Attest 기능을 설정하세요. DeviceCheck 서버 조회에는 Apple Developer 계정의 DeviceCheck 키가 필요합니다.
- **Expo:** 선택적으로 적용하는 config plugin은 [Expo 설정 안내](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/guide/expo-setup)를 참고하세요.

자세한 내용은 [플랫폼 설정](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/device-attestation#setup-requirements)을 참고하세요.

## 사용법

```ts
import { createDeviceIntegrity } from 'react-native-nitro-device-integrity';

const integrity = createDeviceIntegrity();

console.log(integrity.providerType); // 'playIntegrity', 'appAttest', or 'unsupported'
console.log(integrity.isSupported);
```

`isSupported`는 기기에서 API를 사용할 수 있는지 확인합니다. 개발자 계정 설정이나 서버 검증 성공을 보장하지는 않습니다.

| 흐름                    | 앱 호출                                                                          | 백엔드 역할                                |
| ----------------------- | -------------------------------------------------------------------------------- | ------------------------------------------ |
| Play Integrity Standard | `prepareStandardProvider(projectNumber)` 후 `requestIntegrityToken(requestHash)` | 토큰을 복호화하고 요청과 판정 검증         |
| Play Integrity Classic  | `requestClassicIntegrityToken(nonce, projectNumber)`                             | 토큰을 복호화하고 발급한 nonce와 판정 검증 |
| App Attest 등록         | `generateKey()` 후 `attestKey(keyId, clientDataHash)`                            | attestation 검증 후 공개 키 저장           |
| App Attest 요청         | `generateAssertion(keyId, clientDataHash)`                                       | 서명·새 challenge·증가하는 카운터 검증     |
| DeviceCheck             | `getDeviceCheckToken()`                                                          | Apple DeviceCheck 서버 API 사용            |

앱에서 요청 해시를 계산하고 결과를 백엔드로 보내세요. App Attest의 `clientDataHash`는 32바이트 SHA-256 해시를 base64로 인코딩한 값이어야 합니다. assertion의 client data에는 서버가 새로 발급한 challenge와 요청 payload를 포함하세요. `keyId`는 앱에서 저장해야 하며 라이브러리가 대신 보관하지 않습니다.

네이티브 호출에 실패하면 반환한 promise가 reject됩니다. 오류 식별자는 `Error.message`의 접두사로 전달됩니다. 전체 예제, 입력 조건, 오류 접두사, 서버 검증 안내는 [API 레퍼런스](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/device-attestation)를 참고하세요.

## 제한 사항

- iOS 시뮬레이터는 App Attest를 지원하지 않습니다. attestation에는 지원하는 실기기를 사용하세요.
- 토큰만으로 기기를 신뢰할 수는 없습니다. 백엔드에서 provider 응답을 확인하고 서비스의 접근 정책을 적용해야 합니다.
- 미지원 기기, 네트워크 오류, 플랫폼 호출 제한을 처리하세요. App Attest는 탈옥 탐지기가 아니며 attestation은 부정 사용 방지 정책의 판단 근거 중 하나입니다.

## 예제와 기여

[Integrity Demo](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/example/integrity-demo/README-ko.md)에서 클라이언트 흐름을 확인할 수 있습니다. 소스 설치와 테스트는 [기여 안내](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/CONTRIBUTING-ko.md)를 참고하세요.

## 라이선스

MIT
