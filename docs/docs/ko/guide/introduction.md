---
translationOf: guide/introduction.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 소개 {#introduction}

`react-native-nitro-device-info`는 [Nitro Modules](https://nitro.margelo.com/)를 사용해 Swift와 Kotlin으로 구현한 네이티브 코드에서 기기 정보를 읽습니다. 동기 속성, 동기 메서드, Promise 메서드, React 훅을 제공합니다.

## 작업에 맞는 문서 찾기 {#start-with-your-task}

| 작업 | 먼저 읽을 문서 |
| --- | --- |
| React Native 앱에 설치 | [시작하기](/guide/getting-started) |
| Expo 앱에 설치 | [Expo 설정](/guide/expo-setup) |
| 기기 정보 읽기 | [빠른 시작](/guide/quick-start) |
| 기기 상태가 바뀔 때 컴포넌트 갱신 | [React 훅 가이드](/guide/react-hooks) |
| `react-native-device-info` 교체 | [마이그레이션 가이드](/api/migration) |
| 웹 또는 서버 렌더링용 빌드 | [웹 지원](/guide/web-support) |
| 정확한 시그니처와 플랫폼별 fallback 값 확인 | [API 레퍼런스](/api/) |
| AI 도우미에서 문서 사용 | [MCP 연동](/guide/mcp-integration) |

## 네이티브 API와 호환 API 중 선택하기 {#choose-an-api-entry-point}

패키지 루트에서는 네이티브 API를, `/compat`에서는 호환 API를 import할 수 있습니다. 두 API는 이름과 반환 타입이 다릅니다.

```typescript
// Native API: named singleton, properties, and methods.
import { DeviceInfoModule } from 'react-native-nitro-device-info';
const model = DeviceInfoModule.model;
const battery = DeviceInfoModule.getBatteryLevel();
```

```typescript
// Compatibility API: react-native-device-info-style functions.
import DeviceInfo from 'react-native-nitro-device-info/compat';

async function readBattery() {
  return await DeviceInfo.getBatteryLevel();
}
const model = DeviceInfo.getModel();
```

호환 계층은 `react-native-device-info` 15.x를 대상으로 합니다. 전환 전에 [fallback 값과 동작 차이](/api/migration#compat-layer-caveats)를 확인하세요.

## 플랫폼과 반환값 {#platforms-and-return-values}

- **iOS**: 라이브러리의 배포 대상은 15.1 이상입니다.
- **Android**: 라이브러리의 최소 SDK는 API 24(Android 7.0)입니다.
- **웹**: 브라우저 API로 읽을 수 있는 값은 JavaScript 구현에서 제공합니다. 나머지 API는 fallback 값을 반환합니다. [웹 지원](/guide/web-support)을 참고하세요.

React Native와 Nitro 버전에 따라 더 높은 플랫폼 버전이 필요할 수 있습니다. 동기 호출은 호출한 스레드에서 실행되며 결과를 직접 반환합니다. 특정 실행 시간을 보장하지는 않습니다.

지원하지 않거나 읽을 수 없는 값은 `"unknown"`, `-1`, `false`, 빈 컬렉션일 수 있습니다. 결과를 사용하기 전에 각 API의 반환값과 동작을 확인하세요.

## 기기 정보와 보안 {#device-information-and-security}

[로컬 무결성 검사](/api/device-integrity)는 루팅 또는 탈옥 징후를 탐지합니다. 우회할 수 있는 검사이므로 기기의 신뢰성을 증명하지 않습니다.

백엔드에서 검증할 토큰이 필요하면 별도 선택 패키지인 [`react-native-nitro-device-integrity`](/api/device-attestation)를 사용하세요.

구조와 성능 측정 방법은 [Nitro Module을 사용하는 이유](/guide/why-nitro-module)에서 설명합니다.
