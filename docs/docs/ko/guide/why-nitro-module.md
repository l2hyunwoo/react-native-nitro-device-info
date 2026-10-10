---
translationOf: guide/why-nitro-module.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# Nitro Module을 사용하는 이유 {#why-nitro-module}

[Nitro Modules](https://nitro.margelo.com/)는 JSI(JavaScript Interface)를 통해 JavaScript와 네이티브 코드를 연결합니다. 이 라이브러리는 Swift와 Kotlin으로 구현한 Nitro HybridObject를 사용합니다.

## JS 함수 호출로 네이티브 모듈 함수를 어떻게 호출할 수 있을까? {#how-a-call-reaches-native-code}

1. `DeviceInfo.nitro.ts`에서 속성, 메서드, 반환 타입을 선언합니다.
2. Nitrogen이 C++, Swift, Kotlin 바인딩을 생성합니다.
3. `DeviceInfoModule`은 처음 접근할 때 네이티브 HybridObject를 생성합니다.
4. 속성을 읽거나 메서드를 호출하면 바인딩을 통해 네이티브 구현을 실행합니다.

값을 캐시할지 운영체제에서 조회할지는 네이티브 구현이 결정합니다.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

const model = DeviceInfoModule.model; // Synchronous property.
const battery = DeviceInfoModule.getBatteryLevel(); // Synchronous method.

async function readIpAddress() {
  return await DeviceInfoModule.getIpAddress(); // Promise-based method.
}
```

## 동기 getter를 사용할 때 알아둘 점 {#synchronous-access-and-its-limits}

동기 getter는 Promise를 기다리지 않고 값을 읽을 수 있어 기기 메타데이터를 조회하거나 컴포넌트에서 한 번만 값을 읽을 때 유용합니다.

동기 작업도 호출한 스레드에서 실행합니다. getter가 운영체제를 조회하거나 조회한 값을 캐시에 저장할 수 있습니다. JSI가 1밀리초 이내의 완료를 보장하지는 않습니다.

이름이나 다른 기기 정보 라이브러리의 동작만으로 호출 방식을 판단하지 마세요. [API 레퍼런스](/api/)에서 속성, 동기 메서드, Promise 메서드를 구별하세요.

## React 훅은 폴링으로 값을 갱신합니다 {#react-hooks-use-polling}

제공하는 훅은 일정 간격으로 네이티브 getter를 읽고 컴포넌트를 마운트 해제할 때 타이머를 정리합니다. 네이티브 기기 이벤트를 구독하지 않습니다.

예를 들어 `useBatteryLevel()`은 5초마다 조회합니다. 배터리가 바뀌는 즉시 알림을 주지는 않습니다. 훅별 폴링 간격은 [React 훅 가이드](/guide/react-hooks)에서 확인하세요.

## 패키지 루트와 `/compat` API의 차이 {#migration-uses-a-separate-entry-point}

패키지 루트에서 export하는 API에서는 `DeviceInfoModule.model`처럼 속성을 읽습니다. `/compat`에서 export하는 API에서는 `DeviceInfo.getModel()`처럼 함수를 호출합니다.

호환 계층은 `react-native-device-info` 15.x를 대상으로 합니다. 일부 메서드는 fallback 값을 반환하며 네이티브 플랫폼 동작도 다를 수 있습니다. import 경로를 바꾸기 전에 [마이그레이션 가이드](/api/migration)를 확인하세요.

## 앱에서 성능 측정하기 {#measure-in-your-app}

레포지터리의 [벤치마크 앱](https://github.com/l2hyunwoo/react-native-nitro-device-info/tree/main/example/benchmark)으로 앱에 필요한 호출을 비교하세요.

기기, OS, 라이브러리 버전, 빌드 모드를 기록하세요. 캐시에 값이 저장되어 있었는지도 함께 기록하세요. 호출 지연 시간과 렌더링에 미치는 영향을 함께 측정하세요. 이 문서는 지연 시간이나 다른 라이브러리 대비 속도 향상을 보장하지 않습니다.

## 다음 단계 {#next-steps}

- [시작하기](/guide/getting-started): 의존성과 네이티브 설정
- [빠른 시작](/guide/quick-start): 속성, 메서드, React 사용법
- [API 레퍼런스](/api/): 시그니처와 플랫폼 제한
