---
translationOf: api/types.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 타입 정의 {#type-definitions}

`react-native-nitro-device-info`의 TypeScript 타입 정의입니다.

## 타입 가져오기 {#importing-types}

```typescript
import type {
  DeviceInfo,
  PowerState,
  BatteryState,
  DeviceType,
  NavigationMode,
} from 'react-native-nitro-device-info';
```

## 기본 타입 {#core-types}

### PowerState {#powerstate}

전체 전원과 배터리 상태 정보입니다.

```typescript
interface PowerState {
  /**
   * Battery charge level (0.0 to 1.0, or -1 when unavailable)
   * @example 0.75 represents 75% battery
   */
  batteryLevel: number;

  /**
   * Current battery charging status
   */
  batteryState: BatteryState;

  /**
   * Whether low power mode is enabled
   * @platform iOS only - always false on Android
   */
  lowPowerMode: boolean;
}
```

**사용법**:

```typescript
const powerState: PowerState = DeviceInfoModule.getPowerState();

console.log(powerState.batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode ? 'Yes' : 'No'}`);
```

**필드**:

- **batteryLevel**: 0.0(0%)~1.0(100%)의 수치. 조회 불가 시 `-1`
- **batteryState**: 현재 충전 상태(아래 BatteryState 참고)
- **lowPowerMode**: 저전력 모드가 켜져 있는지 표시(iOS 전용)

### BatteryState {#batterystate}

배터리 충전 상태입니다.

```typescript
type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';
```

**값**:

- **unknown**: 배터리 상태 판단 불가
- **unplugged**: 배터리 방전 중(전원 연결 안 됨)
- **charging**: 배터리 충전 중
- **full**: 완전히 충전됨(전원이 연결돼 있을 수 있음)

**사용법**:

```typescript
const powerState = DeviceInfoModule.getPowerState();

switch (powerState.batteryState) {
  case 'charging':
    console.log('Device is charging');
    break;
  case 'full':
    console.log('Battery is full');
    break;
  case 'unplugged':
    console.log('Device is running on battery');
    break;
  case 'unknown':
    console.log('Battery state unknown');
    break;
}
```

### NavigationMode {#navigationmode}

Android 탐색 모드 타입입니다.

```typescript
type NavigationMode = 'gesture' | 'buttons' | 'twobuttons' | 'unknown';
```

**값**:

- **gesture**: 전체 제스처 탐색(스와이프 기반)
- **buttons**: 기존 3버튼 탐색(뒤로, 홈, 최근 앱)
- **twobuttons**: 2버튼 탐색(뒤로, 위로 스와이프하는 홈)
- **unknown**: 판단 불가(iOS에서는 항상 이 값)

**사용법**:

```typescript
const navMode = DeviceInfoModule.navigationMode;

switch (navMode) {
  case 'gesture':
    console.log('Device uses gesture navigation');
    // Add extra bottom padding for gesture conflicts
    break;
  case 'buttons':
    console.log('Device uses 3-button navigation');
    break;
  case 'twobuttons':
    console.log('Device uses 2-button navigation');
    break;
  case 'unknown':
    console.log('Navigation mode unknown (iOS)');
    break;
}
```

**플랫폼 동작**:

- **Android API 29 이상**: 실제 탐색 모드 반환
- **Android API < 29**: `"buttons"` 반환(제스처 탐색 미지원)
- **iOS**: 항상 `"unknown"` 반환

### DeviceType {#devicetype}

기기 유형 분류입니다.

```typescript
type DeviceType =
  | 'Handset' // Smartphone
  | 'Tablet' // Tablet device
  | 'Tv' // TV or set-top box
  | 'Desktop' // Desktop computer
  | 'GamingConsole' // Gaming console
  | 'unknown'; // Unknown device type
```

**값**:

- **Handset**: 일반 스마트폰
- **Tablet**: 태블릿(iPad, Android 태블릿)
- **Tv**: 스마트 TV 또는 셋톱박스
- **Desktop**: 데스크톱 또는 노트북
- **GamingConsole**: 게임 콘솔
- **unknown**: 기기 유형 판단 불가

**사용법**:

```typescript
const deviceType: DeviceType = DeviceInfoModule.deviceType;

if (deviceType === 'Tablet') {
  // Apply tablet-specific layout
  console.log('Tablet detected, using tablet layout');
} else if (deviceType === 'Handset') {
  // Apply phone-specific layout
  console.log('Phone detected, using mobile layout');
}
```

**플랫폼 동작**:

- **iOS**: iPhone, iPad, Apple TV 감지
- **Android**: 화면 크기로 판단(최소 너비 >= 600dp이면 Tablet)

## DeviceInfo 인터페이스 {#deviceinfo-interface}

선언을 앱에 복사하지 말고 배포한 인터페이스를 가져오세요.

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { DeviceInfo } from 'react-native-nitro-device-info';

const deviceInfo: DeviceInfo = DeviceInfoModule;
const model: string = deviceInfo.model;
const hasGms: boolean = deviceInfo.getHasGms();
```

`DeviceInfo`는 타입이며 런타임 싱글턴이 아닙니다. 값을 읽을 때는 `DeviceInfoModule`을 사용하세요.

전체 시그니처 원본은 [`DeviceInfo.nitro.ts`](https://github.com/l2hyunwoo/react-native-nitro-device-info/blob/main/packages/react-native-nitro-device-info/src/DeviceInfo.nitro.ts)입니다. 설치한 릴리스와 현재 웹사이트가 다르면 설치 버전의 선언을 확인하세요. 반환값과 플랫폼 동작은 [DeviceInfo 모듈](/api/device-info)을 참고하세요.

## 사용 예제 {#usage-examples}

### 타입을 검사하는 전원 상태 {#type-safe-power-state}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

function getBatteryStatus(): string {
  const powerState: PowerState = DeviceInfoModule.getPowerState();

  if (powerState.batteryLevel < 0) return 'Battery: unavailable';
  const percentage = (powerState.batteryLevel * 100).toFixed(0);
  const state: BatteryState = powerState.batteryState;

  let statusMessage = `Battery: ${percentage}%`;

  if (state === 'charging') {
    statusMessage += ' (Charging)';
  } else if (state === 'full') {
    statusMessage += ' (Full)';
  }

  if (powerState.lowPowerMode) {
    statusMessage += ' [Low Power Mode]';
  }

  return statusMessage;
}
```

### 타입을 검사하는 기기 유형 처리 {#type-safe-device-type-handling}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
import type { DeviceType } from 'react-native-nitro-device-info';

function getLayoutMode(): 'mobile' | 'tablet' | 'desktop' {
  const deviceType: DeviceType = DeviceInfoModule.deviceType;

  switch (deviceType) {
    case 'Handset':
      return 'mobile';
    case 'Tablet':
      return 'tablet';
    case 'Desktop':
      return 'desktop';
    default:
      return 'mobile'; // Default to mobile for unknown types
  }
}
```

### 사용자 정의 타입 별칭 {#custom-type-aliases}

필요하면 타입 별칭을 만들 수 있습니다.

```typescript
import type { DeviceInfo } from 'react-native-nitro-device-info';

// Alias for device info
type DI = DeviceInfo;

// Custom types for your app
type DeviceCapabilities = {
  hasNotch: boolean;
  hasDynamicIsland: boolean;
  isTablet: boolean;
  isEmulator: boolean;
};

function getDeviceCapabilities(): DeviceCapabilities {
  return {
    hasNotch: DeviceInfoModule.getHasNotch(),
    hasDynamicIsland: DeviceInfoModule.getHasDynamicIsland(),
    isTablet: DeviceInfoModule.isTablet,
    isEmulator: DeviceInfoModule.isEmulator,
  };
}
```

## TypeScript 설정 {#typescript-configuration}

`tsconfig.json` 설정을 확인하세요.

```json
{
  "compilerOptions": {
    "moduleResolution": "node",
    "esModuleInterop": true,
    "strict": true
  }
}
```

## 타입 검사의 이점 {#type-safety-benefits}

### IntelliSense 지원 {#intellisense-support}

모든 메서드와 속성의 자동 완성을 제공합니다.

```typescript
// TypeScript knows all available methods
const model: string = DeviceInfoModule.model;
const charging: boolean = DeviceInfoModule.getIsBatteryCharging();
```

### 컴파일 시 오류 검사 {#compile-time-error-checking}

```typescript
// Intentional type errors: do not copy these into working code.
// @ts-expect-error Property 'invalid' does not exist
const invalid = DeviceInfoModule.invalid;

// @ts-expect-error Expected 1 argument, got 0
const missingThreshold = DeviceInfoModule.isLowBatteryLevel();

// @ts-expect-error Threshold must be a number
const invalidThreshold = DeviceInfoModule.isLowBatteryLevel('0.2');
```

### 타입 가드 {#type-guards}

```typescript
function checkBatteryState(state: BatteryState): string {
  // TypeScript ensures you handle all cases
  switch (state) {
    case 'unknown':
      return 'Battery state unknown';
    case 'unplugged':
      return 'Running on battery';
    case 'charging':
      return 'Charging';
    case 'full':
      return 'Fully charged';
    // TypeScript error if any case is missing
  }
}
```

## 다음 단계 {#next-steps}

- [전체 API 레퍼런스](/api/device-info)에서 사용 가능한 메서드 확인
- [사용 예제](/examples/basic-usage) 확인
- 다른 라이브러리에서 전환하려면 [마이그레이션 가이드](/api/migration) 확인
