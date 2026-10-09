---
translationOf: guide/quick-start.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 빠른 시작 {#quick-start}

먼저 [시작하기](/guide/getting-started) 또는 [Expo 설정](/guide/expo-setup)을 완료하고 네이티브 앱을 다시 빌드하세요.

이 페이지는 패키지 루트의 네이티브 API를 사용합니다. `react-native-device-info` 형식의 함수는 [`/compat` 진입점](/api/migration)을 사용하세요.

## 속성 읽기, 메서드 호출, Promise 대기 {#read-a-property-call-a-method-await-a-promise}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Properties: no parentheses and no await.
const model = DeviceInfoModule.model;
const isTablet = DeviceInfoModule.isTablet;

// Synchronous methods: parentheses, no await.
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const hasGms = DeviceInfoModule.getHasGms();

// Promise-based methods: await inside an async function.
async function readNetworkInfo() {
  try {
    const [ipAddress, carrier] = await Promise.all([
      DeviceInfoModule.getIpAddress(),
      DeviceInfoModule.getCarrier(),
    ]);
    console.log({ ipAddress, carrier });
  } catch (error) {
    console.error('Could not read network information', error);
  }
}

console.log({ model, isTablet, hasGms });
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${Math.round(batteryLevel * 100)}%`);
void readNetworkInfo();
```

`getBatteryLevel()`은 값을 읽을 수 없을 때 `-1`을 반환합니다. `getHasGms()`는 iOS에서 `false`를 반환합니다. Promise 반환 타입은 완료 기한을 정하지 않습니다.

## React에서 바뀌는 값 표시 {#display-changing-values-in-react}

getter를 직접 호출하면 그 시점의 값을 읽습니다. 값이 바뀔 때 컴포넌트도 갱신해야 한다면 훅을 사용하세요.

```tsx
import { Text, View } from 'react-native';
import {
  DeviceInfoModule,
  useBatteryLevel,
} from 'react-native-nitro-device-info';

export default function DeviceInfoScreen() {
  const batteryLevel = useBatteryLevel();

  return (
    <View>
      <Text>Model: {DeviceInfoModule.model}</Text>
      <Text>OS: {DeviceInfoModule.systemVersion}</Text>
      <Text>Battery: {batteryLevel === null
        ? 'Loading or unavailable'
        : `${Math.round(batteryLevel * 100)}%`}</Text>
    </View>
  );
}
```

`useBatteryLevel()`은 마운트 후 값을 읽고 5초마다 폴링합니다. 처음 읽기 전이나 배터리 잔량을 읽을 수 없을 때는 `null`을 반환합니다. 갱신 간격과 다른 반환 타입은 [React 훅](/guide/react-hooks)에서 확인하세요.

## 단위와 미지원 값 확인 {#check-units-and-unsupported-values}

| 값 | 단위 또는 의미 | 사용 전 확인 사항 |
| --- | --- | --- |
| `totalMemory`, `getUsedMemory()` | 바이트. 각각 기기 RAM과 현재 앱 메모리 | 플랫폼에 따라 지원 여부가 다릅니다. |
| `getBatteryLevel()` | `0`~`1`의 비율 | `-1`은 조회 불가를 뜻합니다. |
| `getBrightness()` | iOS에서 `0`~`1`의 비율 | Android에서는 `-1`입니다. |
| `apiLevel` | Android API 수준 | iOS에서는 `-1`입니다. |
| `uniqueId` | iOS IDFV 또는 Android ANDROID_ID | 바뀔 수 있습니다. 계정이나 영구 기기 식별자로 사용하지 마세요. |

정확한 시그니처, 캐시, 권한, 플랫폼 동작은 [DeviceInfo 모듈](/api/device-info)을 참고하세요. 웹에서는 [대체 값](/guide/web-support)을 사용합니다.

## 다음 단계 {#next-steps}

- [기본 사용법](/examples/basic-usage): 작업별 예제
- [API 레퍼런스](/api/): 속성, 메서드, 훅, 타입 찾기
- [마이그레이션 가이드](/api/migration): 호환 API와 네이티브 API 선택
