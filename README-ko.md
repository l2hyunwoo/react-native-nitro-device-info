# react-native-nitro-device-info

> Nitro 모듈을 활용해 React Native에서 디바이스 정보를 빠르고 포괄적으로 가져옵니다.

<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/v/react-native-nitro-device-info.svg?style=flat-square" alt="npm version"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dm/react-native-nitro-device-info.svg?style=flat-square" alt="npm downloads"></a>
<a href="https://www.npmjs.com/package/react-native-nitro-device-info"><img src="https://img.shields.io/npm/dt/react-native-nitro-device-info.svg?style=flat-square" alt="npm total downloads"></a>
<a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square" alt="License: MIT"></a>

📖 **[전체 문서 읽기](https://l2hyunwoo.github.io/react-native-nitro-device-info/)**

[Nitro 모듈](https://nitro.margelo.com/) 기반으로, JSI를 통해 **제로 오버헤드 네이티브 접근**을 제공하는 고성능 React Native 디바이스 정보 라이브러리입니다.

## 주요 특징

- 🚀 **제로 오버헤드 JSI 바인딩** — JavaScript에서 네이티브 코드로 직접 접근
- 📱 **100개 이상의 속성 제공** — 포괄적인 디바이스 정보 조회
- 📦 **TypeScript 우선 설계** — 완전한 타입 정의 포함
- 🔄 **드롭인 호환** — `react-native-device-info`용 호환 레이어 + codemod 내장, `expo-device` API도 친숙하게 지원

## 설치 방법

```sh
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# pnpm
pnpm add react-native-nitro-device-info react-native-nitro-modules
```

> **참고:** `react-native-nitro-modules` 버전 >=0.35.0 <1.0.0이 필요합니다.

### iOS 설정

```sh
cd ios && pod install && cd ..
```

### Android 설정

별도의 설정이 필요 없습니다.
Gradle 자동 링크가 모든 작업을 처리합니다.

## 빠른 시작

### 기본 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 동기 속성 (즉시 - <1ms)
console.log(DeviceInfoModule.deviceId); // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand); // "Apple"
console.log(DeviceInfoModule.model); // "iPhone"

// 동기 속성 (즉시 - <1ms)
const uniqueId = DeviceInfoModule.uniqueId;
console.log(uniqueId); // "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"

const manufacturer = DeviceInfoModule.manufacturer;
console.log(manufacturer); // "Apple"

const isTablet = DeviceInfoModule.isTablet;
console.log(isTablet); // false

const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`배터리: ${(batteryLevel * 100).toFixed(0)}%`); // "배터리: 85%"

// 비동기 메서드 (Promise 기반 - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
console.log(ipAddress); // "192.168.1.100"

const carrier = await DeviceInfoModule.getCarrier();
console.log(carrier); // "SK Telecom"
```

### 고급 사용법

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, DeviceType } from 'react-native-nitro-device-info';

// 디바이스 식별
const deviceId = DeviceInfoModule.deviceId; // "iPhone14,2"
const manufacturer = DeviceInfoModule.manufacturer; // "Apple"
const uniqueId = DeviceInfoModule.uniqueId; // "FCDBD8EF-..."

// 디바이스 기능
const isTablet = DeviceInfoModule.isTablet; // false
const hasNotch = DeviceInfoModule.getHasNotch(); // true
const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland(); // false
const isCameraPresent = DeviceInfoModule.isCameraPresent; // true
const isEmulator = DeviceInfoModule.isEmulator; // false
const deviceYearClass = DeviceInfoModule.deviceYearClass; // 2021 (추정 연도 클래스)

// 시스템 리소스
const totalMemory = DeviceInfoModule.totalMemory;
const usedMemory = DeviceInfoModule.getUsedMemory();
const totalDisk = DeviceInfoModule.totalDiskCapacity;
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
const uptime = DeviceInfoModule.getUptime(); // 부팅 후 경과 시간 (밀리초)

console.log(
  `RAM: ${(usedMemory / 1024 / 1024).toFixed(0)}MB / ${(totalMemory / 1024 / 1024).toFixed(0)}MB`
);
console.log(
  `저장공간: ${(totalDisk / 1024 / 1024 / 1024).toFixed(1)}GB 중 ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB 사용 가능`
);
console.log(
  `가동 시간: ${Math.floor(uptime / 1000 / 60 / 60)}시간 ${Math.floor((uptime / 1000 / 60) % 60)}분`
);

// 배터리 정보
const batteryLevel = DeviceInfoModule.getBatteryLevel();
const isCharging = DeviceInfoModule.getIsBatteryCharging();
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(
  `배터리: ${(batteryLevel * 100).toFixed(0)}% ${isCharging ? '(충전 중)' : ''}`
);
console.log(`저전력 모드: ${powerState.lowPowerMode}`);

// 앱 메타데이터
const version = DeviceInfoModule.version;
const buildNumber = DeviceInfoModule.buildNumber;
const bundleId = DeviceInfoModule.bundleId;
const appName = DeviceInfoModule.applicationName;

console.log(`${appName} (${bundleId})`);
console.log(`버전: ${version} (${buildNumber})`);

// 네트워크 및 연결 (비동기)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();

console.log(`IP: ${ipAddress}`);
console.log(`통신사: ${carrier}`);
console.log(`위치 서비스: ${isLocationEnabled ? '활성화' : '비활성화'}`);

// 플랫폼별
const apiLevel = DeviceInfoModule.apiLevel; // Android: 33, iOS: -1
const abis = DeviceInfoModule.supportedAbis; // ["arm64-v8a"]
const hasGms = DeviceInfoModule.getHasGms(); // Android 전용
const canSideload = DeviceInfoModule.isSideLoadingEnabled(); // Android 전용

// 디바이스 무결성 (루팅/탈옥 탐지) - 로컬 탐지 전용
const isCompromised = DeviceInfoModule.isDeviceCompromised(); // 동기, <50ms
const isCompromisedAsync = await DeviceInfoModule.verifyDeviceIntegrity(); // 비동기
```

> **서버 검증이 가능한 attestation이 필요하신가요?** 위 로컬 검사는 우회 가능합니다.
> 하드웨어 기반·서버 검증 attestation(Android의 Play Integrity, iOS의 App Attest /
> DeviceCheck)이 필요하면 opt-in
> [`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity)
> 패키지를 사용하세요. 클라는 토큰만 발급하고 검증은 여러분의 서버가 수행합니다 —
> 자세한 내용은 [README](packages/react-native-nitro-device-integrity/README.md) 참고.

## API 레퍼런스

100개 이상의 모든 메서드와 속성에 대한 완전한 API 문서는 **[API-REFERENCE-ko.md](API-REFERENCE-ko.md)**를 참고하세요.

### 빠른 참조

#### 주요 속성 (동기 - <1ms)

```typescript
DeviceInfoModule.deviceId; // "iPhone14,2"
DeviceInfoModule.brand; // "Apple"
DeviceInfoModule.systemVersion; // "15.0"
DeviceInfoModule.model; // "iPhone"
```

#### 주요 속성

```typescript
// 디바이스 정보
DeviceInfoModule.uniqueId; // 동기
DeviceInfoModule.isTablet; // 동기
DeviceInfoModule.totalMemory; // 동기
DeviceInfoModule.getBatteryLevel(); // 동기 메서드
DeviceInfoModule.deviceYearClass; // 동기 - 추정 디바이스 연도 클래스
DeviceInfoModule.getUptime(); // 동기 - 부팅 후 경과 시간 (밀리초)

// 앱 정보
DeviceInfoModule.version; // 동기
DeviceInfoModule.bundleId; // 동기

// 플랫폼 (Android)
DeviceInfoModule.isSideLoadingEnabled(); // 동기 - 사이드로딩 권한 확인

// 네트워크 (비동기 메서드)
await DeviceInfoModule.getIpAddress(); // ~20-50ms
await DeviceInfoModule.getCarrier(); // ~20-50ms
```

모든 메서드, 속성 및 상세 문서는 **[API-REFERENCE-ko.md](API-REFERENCE-ko.md)**를 참고하세요.

## 타입 정의

라이브러리는 완전한 TypeScript 정의를 포함합니다. 전체 타입 문서는 [API-REFERENCE-ko.md](API-REFERENCE-ko.md#타입-정의)를 참고하세요.

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
} from 'react-native-nitro-device-info';
```

## react-native-device-info에서 마이그레이션

`react-native-nitro-device-info`는 `react-native-device-info`(RNDI)의 **드롭인 대체재**입니다.
번들로 제공되는 호환 레이어가 RNDI의 정확한 API 표면(동일한 함수명·시그니처·기본 `DeviceInfo`
객체·훅)을 그대로 노출하므로, **import만 바꾸면 호출부는 그대로 둔 채** 마이그레이션할 수 있습니다.

```bash
# 1. 설치
npm install react-native-nitro-device-info react-native-nitro-modules
cd ios && pod install && cd ..

# 2. import 자동 치환 (호출부는 건드리지 않음)
npx react-native-nitro-device-info migrate

# 3. 기존 의존성 제거
npm uninstall react-native-device-info
```

codemod는 모든 `react-native-device-info` import를 `react-native-nitro-device-info/compat`로
치환합니다:

```typescript
// 이전
import DeviceInfo from 'react-native-device-info';
import { getModel, useBatteryLevel } from 'react-native-device-info';

// 이후 (자동 치환됨 — 사용 방식은 동일)
import DeviceInfo from 'react-native-nitro-device-info/compat';
import { getModel, useBatteryLevel } from 'react-native-nitro-device-info/compat';
```

호환 레이어는 RNDI 표면 전체를 커버하며, deprecated되었거나 대응 API가 없는 소수의 API만 문서화된
placeholder 값을 반환합니다. 최고 성능을 원한다면 네이티브 API(`DeviceInfoModule`)가 직접 속성
접근과 동기 getter를 제공합니다. 전체 매핑·주의사항·선택적 네이티브 경로는
[마이그레이션 가이드](https://l2hyunwoo.github.io/react-native-nitro-device-info/api/migration)를
참고하세요.

## 예제 앱

이 저장소에는 라이브러리를 쉽게 테스트할 수 있는 세 가지 예제 앱이 포함되어 있습니다.

### 쇼케이스 앱 (`example/showcase/`)

모든 디바이스 정보를 한눈에 보여주는 단일 화면 예제입니다.
**목적:** 라이브러리의 전체 API를 시각적으로 확인하고 테스트할 수 있습니다.

**실행 방법:**

```bash
# 저장소 루트에서
yarn showcase start
yarn showcase ios
yarn showcase android

# 또는 개별 디렉토리에서
cd example/showcase
yarn start
yarn ios
yarn android
```

### 벤치마크 앱 (`example/benchmark/`)

Nitro 모듈의 성능을 측정하기 위한 독립적인 테스트 앱입니다.
**목적:** 성능 및 스트레스 테스트, 다른 구현체와의 비교.

**실행 방법:**

```bash
# 저장소 루트에서
yarn benchmark start
yarn benchmark ios
yarn benchmark android

# 또는 개별 디렉토리에서
cd example/benchmark
yarn start
yarn ios
yarn android
```

### 무결성 데모 앱 (`example/integrity-demo/`)

opt-in [`react-native-nitro-device-integrity`](packages/react-native-nitro-device-integrity)
패키지의 데모 앱입니다. attestation 토큰(Play Integrity / App Attest / DeviceCheck)을
**발급**해 화면에 표시합니다 — 검증은 설계상 여러분의 서버 책임입니다.

**실행 방법:**

```bash
# 저장소 루트에서
yarn integrity-demo start
yarn integrity-demo ios     # iOS (App Attest는 실기기 필요)
yarn integrity-demo android # Android (Google Play Services 필요)
```

자세한 내용은 아래 문서를 참고하세요.

- [쇼케이스 앱 README](example/showcase/README-ko.md)
- [벤치마크 앱 README](example/benchmark/README-ko.md)
- [무결성 데모 앱 README](example/integrity-demo/README.md)

## AI 통합을 위한 MCP 서버

Claude, Cursor, Copilot 같은 AI 도구가 MCP (Model Context Protocol) 서버를 통해 정확한 라이브러리 문서에 접근할 수 있도록 합니다.

### 빠른 설정 (권장)

React Native 프로젝트에서 `init` 명령어를 실행하면 Cursor와 Claude Code에 대한 MCP 설정이 자동으로 구성됩니다:

```bash
cd your-react-native-project
npx @react-native-nitro-device-info/mcp-server init
```

생성되는 파일:
- `.cursor/mcp.json` - Cursor IDE 설정
- `.mcp.json` - Claude Code 프로젝트 설정

그 다음 IDE를 재시작하고 질문을 시작하세요!

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

저장 후 Claude Desktop을 완전히 재시작하세요 (Cmd+Q 후 다시 실행).

#### Cursor IDE

프로젝트 루트에 `.cursor/mcp.json` 파일을 생성하세요:

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

### 사용 가능한 도구

| 도구 | 용도 | 예시 질문 |
|------|------|----------|
| `search_docs` | 자연어 문서 검색 | "디바이스 모델 가져오는 방법" |
| `get_api` | 특정 API 상세 정보 | "getBatteryLevel 보여줘" |
| `list_apis` | 카테고리/플랫폼/타입별 API 목록 | "네트워크 API 모두 나열" |

그런 다음 AI에게 물어보세요: "react-native-nitro-device-info로 배터리 레벨을 어떻게 가져오나요?"

전체 MCP 서버 문서는 [packages/mcp-server/README.md](packages/mcp-server/README.md)를 참고하세요.

## 지원 플랫폼

- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)

## 기여하기

개발 가이드라인과 워크플로우는 [CONTRIBUTING-ko.md](CONTRIBUTING-ko.md)를 참고하세요.

## 라이선스

MIT © [HyunWoo Lee](https://github.com/l2hyunwoo)

---

Made with ❤️ using [Nitro Modules](https://nitro.margelo.com/)
