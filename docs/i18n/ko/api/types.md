# 타입 정의

`react-native-nitro-device-info`에서 사용되는 TypeScript 타입 정의입니다.

## DeviceInfo

기본 DeviceInfo 모듈 인터페이스입니다.

```typescript
interface DeviceInfo {
  // 기기 식별
  readonly deviceId: string;
  readonly brand: string;
  readonly model: string;
  readonly manufacturer: string;

  // 시스템 정보
  readonly systemVersion: string;
  readonly apiLevel: number;
  readonly buildNumber: string;

  // 애플리케이션
  readonly appVersion: string;
  readonly bundleId: string;

  // 메서드
  getUniqueId(): string;
  isTablet(): boolean;
  getTotalMemory(): number;
  getUsedMemory(): number;
  getBatteryLevel(): number;
  getPowerState(): PowerState;

  // 비동기 메서드
  getIpAddress(): Promise<string>;
  getCarrier(): Promise<string>;
}
```

## PowerState

배터리 및 전원 상태 정보입니다.

```typescript
interface PowerState {
  batteryLevel: number;        // 0-1 범위
  batteryState: BatteryState;
  lowPowerMode: boolean;
}
```

## BatteryState

배터리 충전 상태를 나타내는 열거형입니다.

```typescript
type BatteryState = 
  | 'unknown'
  | 'unplugged'
  | 'charging'
  | 'full';
```

## 사용 예제

```typescript
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

const state: PowerState = DeviceInfoModule.getPowerState();

if (state.batteryState === 'charging') {
  console.log('충전 중...');
}
```

## TypeScript 지원

모든 API는 완전한 TypeScript 정의를 포함하여 IntelliSense 및 타입 체크를 지원합니다.
