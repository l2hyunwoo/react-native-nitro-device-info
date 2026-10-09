---
translationOf: guide/web-support.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 웹 지원 {#web-support}

<span class="rp-badge rp-badge--tip">v1.8.0부터</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원 / fallback</span>

웹용 entry point는 v1.8.0에 도입했습니다. 각 [API 레퍼런스 섹션](/api/#availability-badges)은 브라우저에서 얻는 값과 고정 fallback 값을 구별합니다.

`react-native-nitro-device-info`는 JSI/네이티브 기술인 [Nitro](https://nitro.margelo.com/)를 사용합니다. 브라우저에는 네이티브 모듈이 없으므로 웹에서는 **패키지를 오류 없이 import하고 지원하지 않는 값은 명시적인 fallback 값으로 반환하는 것**을 목표로 합니다. 모든 기기 API를 재현하지는 않습니다.

따라서 네이티브와 웹(react-native-web, Next.js SSR)을 함께 대상으로 하는 모노레포에서도 웹 빌드 오류 없이 패키지를 사용할 수 있습니다.

## 동작 방식 {#how-it-works}

패키지는 `DeviceInfo` 인터페이스 전체를 구현한 순수 JavaScript 웹 구현(`DeviceInfo.web.ts`)을 포함합니다. 번들러가 자동으로 선택하므로 **별도 패키지 설치나 import 경로 변경이 필요하지 않습니다**.

```ts
// Same import on every platform.
import { DeviceInfoModule, createDeviceInfo } from 'react-native-nitro-device-info';
```

일반적인 웹 도구 체인에서는 다음 두 방식으로 웹 구현을 선택합니다.

- **Metro / react-native-web(Expo web)**: Metro는 `.web.ts` 플랫폼 확장자를 해석하여 `index.ts`보다 `index.web.ts`를 먼저 찾습니다. 웹 플랫폼에서는 `browser` export 조건도 적용합니다.
- **webpack / Next.js**: `package.json`의 `exports`는 웹 빌드를 가리키는 `"browser"` 조건을 선언합니다. webpack은 `target: 'web'`에서 이 조건을 따릅니다.

서버 번들러가 네이티브 entry point를 선택하면 HybridObject는 처음 속성에 접근할 때 생성됩니다. 이 entry point를 import하는 것만으로는 HybridObject가 생성되지 않습니다. `DeviceInfoModule.model` 읽기, 메서드 호출, `createDeviceInfo()` 호출은 여전히 네이티브 바인딩이 필요하므로 서버에서 예외가 발생할 수 있습니다.

## 브라우저에서 읽는 값과 fallback 값 {#what-is-real-vs-fallback}

브라우저 API로 조회할 수 있으면 실제 값을 반환합니다. 나머지는 네이티브 구현이 미지원 플랫폼에서 반환하는 상수(`"unknown"` / `-1` / `false` / `[]`)를 반환합니다. **실제 값처럼 보이는 데이터를 만들어 반환하지 않습니다.**

### 브라우저 API에서 얻는 값(지원할 때) {#derived-from-a-browser-api-when-available}

| 멤버 | 출처 |
| --- | --- |
| `systemName` | `navigator.userAgent`에서 추출(`"Windows"`/`"macOS"`/`"iOS"`/`"Android"`/`"Linux"`, 그 외 `"web"`) |
| `systemLanguage` | `navigator.language` |
| `brand`, `manufacturer` | `navigator.vendor` |
| `totalMemory` | `navigator.deviceMemory` × 1024³. 명세에 정한 구간 단위의 대략적인 값이며 지원하지 않으면 `-1` |
| `getIsLandscape()` | `screen.width > screen.height` |
| `getUserAgent()` | `navigator.userAgent` |
| `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | Battery Status API(`navigator.getBattery()`)를 한 번 요청합니다. getter는 이때 얻은 BatteryManager 객체에서 현재 값을 읽습니다. API가 없거나 요청이 거부되면 `-1` / `"unknown"` |
| `isLowBatteryLevel(threshold)` | 브라우저 배터리 잔량과 지정한 임계값을 비교합니다. 잔량을 읽지 못하면 `false` |

오래된 브라우저나 `navigator`/`screen`이 없는 서버처럼 필요한 전역 객체가 없으면 예외 대신 fallback 상수를 반환합니다.

### 웹에서 항상 fallback 상수를 반환하는 값 {#always-a-fallback-constant-on-web}

- 모든 Android `Build.*` 필드(`androidId`, `serialNumber`, `fingerprint`, `board`, `bootloader`, `apiLevel`, `securityPatch`, …)
- 통신사 / MCC / MNC 정보
- 디스크 용량과 사용 메모리
- 헤드폰, 위치, 노치, Dynamic Island 검사
- 비행기 모드: 브라우저에서 상태를 판단할 수 없으므로 `getIsAirplaneMode()`는 `false`
- 무결성 검사: `isDeviceCompromised()`는 `false`
- 앱 메타데이터(`version`, `buildNumber`, `bundleId`, `applicationName`, …)
- Windows 전용 필드(`isMouseConnected`, `hostNames`, …)

### Promise 메서드 {#promise-methods}

Promise 메서드는 시그니처를 유지하고 fallback 값으로 **resolve**합니다. reject하지 않으므로 기존 `await` 호출을 유지할 수 있습니다.

```ts
await DeviceInfoModule.getIpAddress();          // "unknown"
await DeviceInfoModule.verifyDeviceIntegrity(); // false
```

예외적으로 `getDeviceToken()`은 웹에서 **reject**합니다. 이 메서드는 웹에 대응 기능이 없는 Apple DeviceCheck를 사용하며, Android에서 문서화한 동작과 같습니다.

## SSR 주의 사항 {#ssr-notes}

웹 구현은 브라우저 전역 객체를 확인하므로 서버 렌더링 중에도 fallback 값을 반환할 수 있습니다. 단, 서버 번들이 웹 구현을 선택했을 때만 적용됩니다.

서버가 네이티브 entry point를 선택한다면 기기 정보는 `useEffect` 같은 클라이언트 전용 코드에서 읽으세요. React는 서버에서도 컴포넌트 본문을 렌더링하므로 본문에서 속성을 읽으면 네이티브 초기화가 실행될 수 있습니다. SSR 중에 값을 읽기 전에 프레임워크의 서버 모듈 해석 방식을 확인하세요.

서버와 브라우저의 값은 다를 수 있습니다. 브라우저에서 얻은 값 때문에 하이드레이션 불일치가 생긴다면 먼저 일관된 로딩 상태를 렌더링하세요.
