---
translationOf: api/hooks.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# React 훅 {#react-hooks}

앱 실행 중 기기 속성의 변화를 관찰하는 React 훅입니다. 네이티브 getter를 폴링하고 읽은 값이 바뀌면 다시 렌더링합니다. [갱신 간격과 초기값](/guide/react-hooks#update-intervals-and-initial-values)을 참고하세요.

7개 훅 모두 v1.4.0에 도입했습니다. 네이티브 최소 버전은 iOS 15.1과 Android API 24입니다. 웹은 v1.8.0 이상이 필요합니다. [지원 여부 배지](/api/#availability-badges)를 참고하세요.

이 페이지는 패키지 루트에서 export하는 훅을 설명합니다. `/compat`의 헤드폰 훅은 `boolean` 대신 `{ loading, result }`를 반환합니다.

## import {#import}

```typescript
import {
  useBatteryLevel,
  useBatteryLevelIsLow,
  usePowerState,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';
```

---

## 배터리 훅 {#battery-hooks}

### `useBatteryLevel()` {#usebatterylevel}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

마운트 후 배터리 잔량을 읽고 5초마다 폴링합니다.

```typescript
function useBatteryLevel(): number | null
```

**반환값**: 배터리 잔량(0.0~1.0). 초기 로딩 중이거나 조회할 수 없으면 `null`입니다.

**예제**:

```tsx
import { useBatteryLevel } from 'react-native-nitro-device-info';

function BatteryIndicator() {
  const batteryLevel = useBatteryLevel();

  if (batteryLevel === null) {
    return <Text>Loading...</Text>;
  }

  return <Text>Battery: {Math.round(batteryLevel * 100)}%</Text>;
}
```

---

### `useBatteryLevelIsLow()` {#usebatterylevelislow}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

플랫폼별 임계값으로 배터리 부족 상태를 관찰합니다.

```typescript
function useBatteryLevelIsLow(): number | null
```

**반환값**: 임계값보다 낮으면 배터리 잔량을 반환합니다. 부족하지 않거나 조회할 수 없으면 `null`입니다. 배터리 잔량을 읽을 수 없을 때는 배터리 부족 경고를 발생시키지 않습니다.

**임계값**:

- **iOS**: 20%(iOS 저전력 모드 기준과 동일)
- **Android**: 15%(Android 배터리 부족 경고 기준과 동일)

**예제**:

```tsx
import { useBatteryLevelIsLow } from 'react-native-nitro-device-info';

function LowBatteryWarning() {
  const lowBattery = useBatteryLevelIsLow();

  if (lowBattery !== null) {
    return (
      <View style={styles.warning}>
        <Text>Low Battery: {Math.round(lowBattery * 100)}%</Text>
      </View>
    );
  }

  return null;
}
```

---

### `usePowerState()` {#usepowerstate}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: 제한적 지원</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

배터리 잔량, 충전 상태, 저전력 모드 등 전체 전원 상태를 관찰합니다.

```typescript
function usePowerState(): Partial<PowerState>
```

Android에서 `lowPowerMode`는 항상 `false`입니다.

**반환값**: `Partial<PowerState>` 객체입니다. 모든 속성은 선택 사항이며 초기 로딩 중이거나 플랫폼에서 지원하지 않으면 `undefined`일 수 있습니다.

- `batteryLevel?: number`: 배터리 잔량(0.0~1.0). 조회 불가 시 `-1`
- `batteryState?: BatteryState`: 충전 상태('unknown', 'unplugged', 'charging', 'full')
- `lowPowerMode?: boolean`: 저전력 모드가 켜져 있는지 여부(iOS 전용)

**예제**:

```tsx
import { usePowerState } from 'react-native-nitro-device-info';

function PowerStatus() {
  const powerState = usePowerState();
  const level = powerState.batteryLevel;

  return (
    <View>
      <Text>Level: {level === undefined || level < 0
        ? 'Loading or unavailable'
        : Math.round(level * 100) + '%'}</Text>
      <Text>Status: {powerState.batteryState ?? 'unknown'}</Text>
      <Text>Low Power: {powerState.lowPowerMode ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

---

## 헤드폰 훅 {#headphone-hooks}

### `useIsHeadphonesConnected()` {#useisheadphonesconnected}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

헤드폰 연결 상태를 관찰합니다(유선 또는 Bluetooth).

```typescript
function useIsHeadphonesConnected(): boolean
```

**반환값**: 헤드폰이 연결됐으면 `true`, 그 외 `false`입니다.

**예제**:

```tsx
import { useIsHeadphonesConnected } from 'react-native-nitro-device-info';

function AudioOutput() {
  const headphonesConnected = useIsHeadphonesConnected();

  return (
    <Text>
      Audio: {headphonesConnected ? 'Headphones' : 'Speaker'}
    </Text>
  );
}
```

---

### `useIsWiredHeadphonesConnected()` {#useiswiredheadphonesconnected}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

유선 헤드폰 연결 상태를 관찰합니다.

```typescript
function useIsWiredHeadphonesConnected(): boolean
```

**반환값**: 유선 헤드폰이 연결됐으면 `true`, 그 외 `false`입니다.

**예제**:

```tsx
import { useIsWiredHeadphonesConnected } from 'react-native-nitro-device-info';

function WiredAudioStatus() {
  const wiredConnected = useIsWiredHeadphonesConnected();

  return (
    <Icon
      name={wiredConnected ? 'headphones' : 'headphones-off'}
      color={wiredConnected ? 'green' : 'gray'}
    />
  );
}
```

---

### `useIsBluetoothHeadphonesConnected()` {#useisbluetoothheadphonesconnected}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Bluetooth 헤드폰·오디오 기기의 연결 상태를 관찰합니다.

```typescript
function useIsBluetoothHeadphonesConnected(): boolean
```

**반환값**: Bluetooth 오디오 기기가 연결됐으면 `true`, 그 외 `false`입니다.

**예제**:

```tsx
import { useIsBluetoothHeadphonesConnected } from 'react-native-nitro-device-info';

function BluetoothAudioStatus() {
  const bluetoothConnected = useIsBluetoothHeadphonesConnected();

  return (
    <Icon
      name="bluetooth"
      color={bluetoothConnected ? 'blue' : 'gray'}
    />
  );
}
```

---

## 디스플레이 훅 {#display-hooks}

### `useBrightness()` {#usebrightness}

<span class="rp-badge rp-badge--tip">v1.4.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

화면 밝기 변화를 관찰합니다(iOS 전용).

```typescript
function useBrightness(): number | null
```

**반환값**:

- **iOS**: 밝기(0.0~1.0). 초기 로딩 중에는 `null`
- **Android**: `-1`(미지원)

**예제**:

```tsx
import { useBrightness } from 'react-native-nitro-device-info';
import { Platform } from 'react-native';

function BrightnessIndicator() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return <Text>Brightness monitoring is iOS only</Text>;
  }

  if (brightness === null) {
    return <Text>Loading...</Text>;
  }

  return <Text>Brightness: {Math.round(brightness * 100)}%</Text>;
}
```

---

## 플랫폼 지원 요약 {#platform-support-summary}

| 훅 | iOS | Android |
| --- | --- | --- |
| `useBatteryLevel` | ✅ | ✅ |
| `useBatteryLevelIsLow` | ✅ | ✅ |
| `usePowerState` | ✅ | ✅ |
| `useIsHeadphonesConnected` | ✅ | ✅ |
| `useIsWiredHeadphonesConnected` | ✅ | ✅ |
| `useIsBluetoothHeadphonesConnected` | ✅ | ✅ |
| `useBrightness` | ✅ | ❌ (-1) |

---

## 권장 사용법 {#best-practices}

### 로딩 상태 처리 {#handle-loading-states}

```tsx
const batteryLevel = useBatteryLevel();

if (batteryLevel === null) {
  return <LoadingSpinner />;
}
```

### 훅 값을 사용하는 컴포넌트에 React.memo 적용 {#memoize-dependent-components}

```tsx
const BatteryIcon = React.memo(({ level }: { level: number }) => {
  return <Icon name={getBatteryIcon(level)} />;
});

function Parent() {
  const level = useBatteryLevel();
  return level !== null && <BatteryIcon level={level} />;
}
```

### 플랫폼별 처리 {#platform-specific-handling}

```tsx
import { Platform } from 'react-native';

function BrightnessControl() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return null; // Not supported on Android
  }

  return <BrightnessSlider value={brightness} />;
}
```

---

## react-native-device-info에서 마이그레이션 {#migration-from-react-native-device-info}

`react-native-device-info` 훅의 결과 형태를 유지하려면 `/compat`을 사용하세요.

```tsx
// Before (react-native-device-info)
import { useBatteryLevel } from 'react-native-device-info';

// After (compatibility entry point)
import { useBatteryLevel } from 'react-native-nitro-device-info/compat';

// Usage remains identical
const batteryLevel = useBatteryLevel();
```

자세한 내용은 [마이그레이션 가이드](/api/migration)를 참고하세요.
