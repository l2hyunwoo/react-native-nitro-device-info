# react-native-nitro-device-info

> Nitro Modules로 React Native의 기기 정보를 읽습니다.

<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/v/react-native-nitro-device-info.svg?style=flat-square" alt="npm 버전"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dm/react-native-nitro-device-info.svg?style=flat-square" alt="npm 월간 다운로드"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dt/react-native-nitro-device-info.svg?style=flat-square" alt="npm 전체 다운로드"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="라이선스: MIT"></a>

[English](README.md) | **한국어**

📖 **[한국어 문서](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/)**

[Nitro Modules](https://nitro.margelo.com/)와 JSI를 통해 네이티브 코드에 직접 접근하는 React Native 기기 정보 라이브러리입니다.

## 기능

- 🚀 **JSI 바인딩**: JavaScript와 네이티브 코드의 직접 통신
- 📱 **100개 이상의 기기 속성**: 기기 정보와 시스템 상태 조회
- 📦 **TypeScript 지원**: 전체 타입 정의 포함
- 🔄 **호환 계층**: `react-native-device-info`용 `/compat`과 codemod, `expo-device`에 익숙한 API 제공

## 설치

```sh
# Using npm
npm install react-native-nitro-device-info react-native-nitro-modules

# Using yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# Using pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **필수 피어 의존성**: `react-native-nitro-modules` >=0.35.0 <1.0.0

### iOS 설정

```sh
cd ios && pod install && cd ..
```

Pod는 `PrivacyInfo.xcprivacy`를 `NitroDeviceInfo_privacy.bundle`에 포함합니다. Expo prebuild / EAS Build에서도 같습니다. 개인정보 보호 전용 config plugin 옵션은 필요하지 않습니다. 선언한 API 사유와 사용 제한은 [iOS 개인정보 보호 매니페스트](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/guide/getting-started#ios-privacy-manifest)를 참고하세요.

### Android 설정

Gradle 자동 연결이 네이티브 모듈을 등록합니다. 권한이 필요한 API에는 별도 설정이 필요할 수 있습니다.

### Expo(prebuild / 개발 클라이언트)

Expo 개발 빌드를 사용하세요. Expo Go에는 이 네이티브 모듈이 없습니다. 설치하거나 네이티브 설정을 바꾼 뒤 앱을 다시 빌드하세요.

```sh
npx expo install react-native-nitro-device-info react-native-nitro-modules
```

대부분의 API는 자동 연결로 충분합니다. 권한이나 entitlement가 필요한 API는 `app.json`의 config plugin에서 선택적으로 설정합니다.

```json
{
  "expo": {
    "plugins": [
      ["react-native-nitro-device-info", { "enableSerialNumber": true }]
    ]
  }
}
```

수동으로 바꾼 네이티브 코드를 먼저 보존한 뒤 `npx expo prebuild --clean`을 실행하세요. 이 명령은 `ios/`와 `android/`를 삭제하고 다시 만듭니다. 전체 옵션, 기기 증명 plugin, `isSideLoadingEnabled()` 주의 사항은 [Expo 설정](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/guide/expo-setup)을 참고하세요.

## 빠른 시작

루트 내보내기는 네이티브 속성과 메서드를 사용합니다. `react-native-device-info` 15.x 형식의 함수 호출을 유지하려면 `react-native-nitro-device-info/compat`을 사용하세요. [마이그레이션 주의 사항](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/migration#compat-layer-caveats)을 확인하세요.

동기 호출은 특정 지연 시간을 보장하지 않습니다. 배터리 값을 읽을 수 없으면 getter는 `-1`, 훅은 `null`을 반환합니다. 바뀌는 값에는 [React 훅](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/guide/react-hooks)을 사용하세요.

### 기본 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Synchronous properties
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"
console.log(DeviceInfoModule.model); // "iPhone 13 Pro"

// Synchronous properties
const uniqueId = DeviceInfoModule.uniqueId;
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.manufacturer;
console.log(manufacturer); // "Apple"

const isTablet = DeviceInfoModule.isTablet;
console.log(isTablet); // false

// Returns -1 when unavailable; useBatteryLevel() returns null.
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`Battery: ${batteryLevel >= 0 ? `${(batteryLevel * 100).toFixed(0)}%` : 'unavailable'}`); // "Battery: 85%"

// Asynchronous methods (use inside an async function)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"

const carrier = await DeviceInfoModule.getCarrier();
console.log(carrier); // "T-Mobile"
```

### 고급 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, DeviceType } from 'react-native-nitro-device-info';

// Device Identification
const deviceId = DeviceInfoModule.deviceId; // "iPhone14,2"
const manufacturer = DeviceInfoModule.manufacturer; // "Apple"
const uniqueId = DeviceInfoModule.uniqueId; // "FCDBD8EF-..."

// Device Capabilities
const isTablet = DeviceInfoModule.isTablet; // false
const hasNotch = DeviceInfoModule.getHasNotch(); // true
const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland(); // false
const isCameraPresent = DeviceInfoModule.isCameraPresent; // iOS: camera hardware present; false on simulator, no permission prompt
const isPinOrFingerprintSet = DeviceInfoModule.isPinOrFingerprintSet; // iOS: passcode or biometrics available; no authentication prompt
const isEmulator = DeviceInfoModule.isEmulator; // false
const deviceYearClass = DeviceInfoModule.deviceYearClass; // 2021 (estimated year class)

// System Resources
const resourceReadStartedAt = DeviceInfoModule.getUptime();
const totalMemory = DeviceInfoModule.totalMemory;
const usedMemory = DeviceInfoModule.getUsedMemory();
const totalDisk = DeviceInfoModule.totalDiskCapacity;
const freeDisk = DeviceInfoModule.getFreeDiskStorage();

console.log(
  `RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`
);
console.log(
  `Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB free of ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB`
);
console.log(
  `Resource reads took ${DeviceInfoModule.getUptime() - resourceReadStartedAt}ms`
);

// Battery Information
// Returns -1 when unavailable; useBatteryLevel() returns null.
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const isCharging = DeviceInfoModule.getIsBatteryCharging();
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(
  `Battery: ${batteryLevel >= 0 ? `${(batteryLevel * 100).toFixed(0)}%` : 'unavailable'} ${isCharging ? '(charging)' : ''}`
);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`);

// Application Metadata
const version = DeviceInfoModule.version;
const buildNumber = DeviceInfoModule.buildNumber;
const bundleId = DeviceInfoModule.bundleId;
const appName = DeviceInfoModule.applicationName;

console.log(`${appName} (${bundleId})`);
console.log(`Version: ${version} (${buildNumber})`);

// Network & Connectivity (Async)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();

console.log(`IP: ${ipAddress}`);
console.log(`Carrier: ${carrier}`);
console.log(`Location Services: ${isLocationEnabled ? 'enabled' : 'disabled'}`);

// Platform-Specific
const apiLevel = DeviceInfoModule.apiLevel; // Android: 33, iOS: -1
const abis = DeviceInfoModule.supportedAbis; // ["arm64-v8a"]
const hasGms = DeviceInfoModule.getHasGms(); // Android only
const canSideload = DeviceInfoModule.isSideLoadingEnabled(); // Android only

// Device Integrity (Root/Jailbreak Detection) - Local detection only
const isCompromised = DeviceInfoModule.isDeviceCompromised(); // Sync, <50ms
const isCompromisedAsync = await DeviceInfoModule.verifyDeviceIntegrity(); // Async
```

Android MAC 주소 getter는 5초 캐시를 공유하며 접근이 제한되거나 Wi-Fi 주소가 없으면 `"unknown"`을 반환합니다.

Android 헤드폰 감지는 유선·USB 헤드셋(API 26 이상 USB 지원)과 Bluetooth를 구별합니다. 비동기·동기 getter가 같은 감지를 사용합니다.

> **서버에서 검증하는 기기 증명이 필요한가요?** 위 로컬 검사는 우회할 수 있습니다. 하드웨어 기반의 서버 검증(Play Integrity / App Attest / DeviceCheck)에는 선택 패키지 [`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity/README-ko.md)를 사용하세요. 패키지가 발급한 토큰은 백엔드에서 검증해야 합니다. 이 패키지는 2026-10-10 기준 미배포 상태이며 npm 설치는 배포 후에 가능합니다.

## API 레퍼런스

100개 이상의 메서드와 속성은 **[한국어 API 레퍼런스](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/)**에서 확인하세요.

각 API 절은 도입 버전과 플랫폼 배지를 표시합니다. OS 최소 버전, 제한적 지원, 대체 값, 미배포 구현의 구별은 [배지 정의](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/#availability-badges)를 참고하세요.

### 빠른 참조

#### 기본 속성(동기)

```typescript
DeviceInfoModule.deviceId; // "iPhone14,2"
DeviceInfoModule.brand; // "Apple"
DeviceInfoModule.systemVersion; // "15.0"
DeviceInfoModule.model; // "iPhone 13 Pro"
```

#### 자주 쓰는 속성

```typescript
// Device Info
DeviceInfoModule.uniqueId; // Sync
DeviceInfoModule.isTablet; // Sync
DeviceInfoModule.totalMemory; // Sync
DeviceInfoModule.getBatteryLevel(); // Sync method
DeviceInfoModule.deviceYearClass; // Sync - estimated device year class
DeviceInfoModule.getUptime(); // Sync - clock for elapsed time between app events

// App Info
DeviceInfoModule.version; // Sync
DeviceInfoModule.bundleId; // Sync

// Platform (Android)
DeviceInfoModule.isSideLoadingEnabled(); // Sync - check sideloading permission

// Network (Async methods)
await DeviceInfoModule.getIpAddress(); // Promise<string>
await DeviceInfoModule.getCarrier(); // Promise<string>
```

전체 메서드와 속성의 상세 설명은 **[API 레퍼런스](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/)**를 참고하세요.

## 타입 정의

전체 TypeScript 정의를 제공합니다. [타입 정의](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/types)에서 확인하세요.

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';
```

## react-native-device-info에서 마이그레이션

포함된 `/compat` 진입점으로 `react-native-device-info`(RNDI) 15.x 가져오기를 바꿀 수 있습니다. 함수 시그니처와 훅 결과 형태를 맞춰 호출 코드를 유지합니다. 플랫폼 동작은 다를 수 있고 일부 API는 대체 값을 반환합니다. [호환성 주의 사항](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/migration#compat-layer-caveats)을 읽고 앱에서 쓰는 API를 테스트하세요.

```bash
# 1. Install
npm install react-native-nitro-device-info react-native-nitro-modules
cd ios && pod install && cd ..

# 2. Rewrite imports automatically (call sites untouched)
npx react-native-nitro-device-info migrate

# 3. Remove the old dependency
npm uninstall react-native-device-info
```

codemod가 모든 `react-native-device-info` 가져오기를 `react-native-nitro-device-info/compat`으로 바꿉니다.

```typescript
// Before
import DeviceInfo from 'react-native-device-info';
import { getModel, useBatteryLevel } from 'react-native-device-info';

// After (rewritten for you — usage is identical)
import DeviceInfo from 'react-native-nitro-device-info/compat';
import { getModel, useBatteryLevel } from 'react-native-nitro-device-info/compat';
```

호환 계층은 RNDI 15.x를 대상으로 합니다. 일부 사용 중단 예정·미지원 API는 문서에 명시한 대체 값을 반환합니다. 네이티브 API(`DeviceInfoModule`)는 직접 속성 접근과 동기 getter를 제공합니다. 전체 대응표, 주의 사항, 선택 가능한 네이티브 경로는 [마이그레이션 가이드](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/api/migration)를 참고하세요.

## 소개된 매체

- [This Week in React #256](https://thisweekinreact.com/newsletter/256#react-native)
- [NativeWeekly - React Native dev briefing](https://nativeweekly.beehiiv.com/)
  - [October 31 2025: Issue 3](https://nativeweekly.beehiiv.com/p/october-31-2025-issue-3)
  - [Nov 14 2025: Issue 5](https://nativeweekly.beehiiv.com/p/nov-14-2025-issue-5)
- [The React Native Rewind](https://thereactnativerewind.com/)
  - [A Nitro Revolution, Building Games in React Native, and a New Era of Navigation](https://thereactnativerewind.com/issues-blog-post/a-nitro-revolution-building-games-in-react-native-and-a-new-era-of-navigation)

## 예제 앱

저장소에는 라이브러리를 사용하고 테스트할 예제 앱 세 개가 있습니다.

### Showcase 앱(`example/showcase/`)

여러 기기 정보를 표시하는 단일 화면 앱입니다. 사용 가능한 기기 속성과 API 사용법을 보여 줍니다.

**실행**:

```bash
# From repository root
yarn showcase start  # Start Metro bundler
yarn showcase ios    # Run on iOS
yarn showcase android # Run on Android

# Or from the showcase directory
cd example/showcase
yarn start           # Start Metro bundler
yarn ios             # Run on iOS
yarn android         # Run on Android
```

### Benchmark 앱(`example/benchmark/`)

Nitro 모듈의 성능 측정, 부하 테스트, 다른 구현과의 비교를 위한 앱입니다.

**실행**:

```bash
# From repository root
yarn benchmark start  # Start Metro bundler
yarn benchmark ios    # Run on iOS
yarn benchmark android # Run on Android

# Or from the benchmark directory
cd example/benchmark
yarn start            # Start Metro bundler
yarn ios              # Run on iOS
yarn android          # Run on Android
```

### Integrity Demo 앱(`example/integrity-demo/`)

선택 패키지 [`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity/README-ko.md)의 예제입니다. 기기 증명 토큰(Play Integrity / App Attest / DeviceCheck)을 **발급**하고 화면에 표시합니다. 검증은 서버에서 담당합니다.

**실행**:

```bash
# From repository root
yarn integrity-demo start   # Start Metro bundler
yarn integrity-demo ios     # Run on iOS (real device required for App Attest)
yarn integrity-demo android # Run on Android (needs Google Play Services)
```

자세한 내용은 각 README를 참고하세요.

- [Showcase 앱](example/showcase/README-ko.md)
- [Benchmark 앱](example/benchmark/README-ko.md)
- [Integrity Demo 앱](example/integrity-demo/README-ko.md)

## AI 연동용 MCP 서버

MCP(Model Context Protocol) 서버로 Claude, Cursor, Copilot 같은 AI 도구에서 라이브러리 문서를 조회할 수 있습니다.

### 빠른 설정(권장)

React Native 프로젝트에서 `init`을 실행하면 Cursor와 Claude Code용 MCP 설정을 자동 생성합니다.

```bash
cd your-react-native-project
npx @react-native-nitro-device-info/mcp-server init
```

다음 파일을 만듭니다.

- `.cursor/mcp.json`: Cursor IDE 설정
- `.mcp.json`: Claude Code 프로젝트 설정

IDE를 재시작한 뒤 질문하세요.

### 수동 설정

#### Claude Desktop

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

저장 후 Claude Desktop을 완전히 종료하고(Cmd+Q) 다시 실행하세요.

#### Cursor IDE

프로젝트 루트에 `.cursor/mcp.json`을 만드세요.

```json
{
  "mcpServers": {
    "nitro-device-info": {
      "command": "npx",
      "args": ["@react-native-nitro-device-info/mcp-server"]
    }
  }
}
```

### 제공 도구

| 도구 | 용도 | 질문 예시 |
| --- | --- | --- |
| `search_docs` | 자연어 문서 검색 | "기기 모델을 어떻게 읽나요?" |
| `get_api` | 특정 API의 상세 정보 | "getBatteryLevel을 보여 주세요" |
| `list_apis` | 범주·플랫폼·타입별 API 목록 | "네트워크 API를 모두 보여 주세요" |

예: "react-native-nitro-device-info로 배터리 잔량을 어떻게 읽나요?"

MCP 패키지는 빌드 시점의 한국어·영어 문서 스냅샷을 포함합니다. 배포된 웹사이트를 실시간으로 가져오거나 한국어 질의를 번역하지 않습니다. 문서가 바뀌면 MCP 패키지도 다시 빌드·배포해야 합니다. 전체 안내는 [MCP 서버 README](packages/mcp-server/README-ko.md)를 참고하세요.

## 플랫폼 지원

- **iOS**: 15.1 이상
- **Android**: API 24 이상(Android 7.0 Nougat)
- **웹**: 안전하게 가져올 수 있는 대체 구현(아래 참고)

React Native와 Nitro 의존성은 더 높은 최소 플랫폼 버전을 요구할 수 있습니다.

## 웹 지원

Nitro는 JSI/네이티브 기술이므로 브라우저에는 네이티브 모듈이 없습니다. 이 패키지는 네이티브와 웹(react-native-web, Next.js SSR)을 함께 대상으로 하는 앱을 빌드할 수 있도록 순수 JavaScript 웹 대체 구현을 제공합니다. 번들러가 자동 선택하며 별도 설치나 가져오기 경로 변경은 필요하지 않습니다.

```ts
// Same import on every platform.
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// On web this returns a fallback value instead of throwing.
console.log(DeviceInfoModule.systemLanguage); // e.g. "en-US" from navigator.language
console.log(DeviceInfoModule.deviceId);       // "unknown" — not available in a browser
```

브라우저 API로 읽을 수 있으면 실제 값을 반환하고 나머지는 미지원 플랫폼용 상수(`"unknown"` / `-1` / `false` / `[]`)를 반환합니다. 실제 값처럼 보이는 데이터를 만들어 반환하지 않습니다.

**브라우저 API에서 얻는 값(미지원 시 대체 값)**:

| 멤버 | 출처 |
| --- | --- |
| `systemName` | `navigator.userAgent`에서 추출(`"Windows"`/`"macOS"`/`"iOS"`/`"Android"`/`"Linux"`, 그 외 `"web"`) |
| `systemLanguage` | `navigator.language` |
| `brand`, `manufacturer` | `navigator.vendor` |
| `totalMemory` | `navigator.deviceMemory` × 1024³. 명세 구간에 따른 대략적인 값. 미지원 시 `-1` |
| `getIsLandscape()` | `screen.width > screen.height` |
| `getUserAgent()` | `navigator.userAgent` |
| `getBatteryLevel()`, `getPowerState()`, `getIsBatteryCharging()` | Battery Status API(`navigator.getBattery()`)를 한 번 요청하고 getter는 살아 있는 BatteryManager를 읽음. API가 없거나 거부되면 `-1`/`unknown` |
| `getIsAirplaneMode()` | `false`(브라우저에서 비행기 모드를 판단할 수 없음) |

**웹에서 항상 대체 상수를 반환하는 항목**: Android `Build.*` 필드, 통신사/MNC/MCC, 디스크·사용 메모리, 헤드폰·위치·노치 검사, 무결성 검사(`isDeviceCompromised()` → `false`), 앱 메타데이터(`version`/`bundleId`/…), Windows 전용 필드입니다. Promise 메서드는 시그니처를 유지하고 대체 값으로 이행하며 거부하지 않습니다. 예외인 `getDeviceToken()`은 Android와 마찬가지로 웹에서도 거부합니다. 웹에 대응 기능이 없는 Apple DeviceCheck API입니다.

**SSR**: 웹 구현은 브라우저 전역 객체를 확인하므로 `navigator`/`screen`/`window`가 없는 서버에서도 대체 값을 읽을 수 있습니다. 서버 번들이 웹 구현을 선택했을 때만 적용됩니다. 네이티브 진입점을 선택한 서버에서 속성 읽기, 메서드 호출, `createDeviceInfo()`는 네이티브 바인딩이 필요하므로 예외가 발생할 수 있습니다. [웹 지원](https://l2hyunwoo.github.io/react-native-nitro-device-info/ko/guide/web-support)을 확인하세요.

## 기여

개발 절차는 [CONTRIBUTING-ko.md](CONTRIBUTING-ko.md)를 참고하세요.

## 라이선스

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

[Nitro Modules](https://nitro.margelo.com/)로 만들었습니다. ❤️
