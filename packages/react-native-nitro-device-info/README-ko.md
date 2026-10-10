# react-native-nitro-device-info

Nitro Modules로 React Native의 기기 정보를 읽습니다. 기기·배터리·네트워크·디스플레이·시스템 API, React hook, 웹 fallback을 제공합니다.

```sh
npm install react-native-nitro-device-info react-native-nitro-modules
```

설치 후 iOS Pod를 설치하고 네이티브 앱을 다시 빌드하세요. 이 패키지는 iOS 15.1 이상과 Android API 24 이상을 지원합니다. React Native와 Nitro 버전은 더 높은 최소 플랫폼 버전을 요구할 수 있습니다.

사용법과 마이그레이션 예제는 [프로젝트 README](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/README-ko.md)를 참고하세요. 메서드 시그니처와 플랫폼 지원 범위는 [API 문서](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/)에서 확인할 수 있습니다.

서버에서 검증하는 Play Integrity·App Attest·DeviceCheck 토큰이 필요하면 별도 선택 패키지 `react-native-nitro-device-integrity`를 사용하세요. integrity는 2026-10-10 기준 미배포 상태이며 토큰 검증에는 백엔드가 필요합니다.

모든 패키지는 하나의 저장소에서 개발하며 Changesets로 버전을 독립적으로 관리합니다. [배포 절차](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/CONTRIBUTING-ko.md#npm-배포)를 참고하세요.
