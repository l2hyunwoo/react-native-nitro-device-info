---
translationOf: guide/react-hooks.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# React 훅 가이드 {#react-hooks-guide}

React Native 앱에서 React 훅으로 기기 속성의 변화를 확인하고 화면을 갱신하는 방법을 설명합니다.

## 개요 {#overview}

React 훅은 마운트 후 기기 getter를 읽고 값을 갱신하려고 일정 간격으로 폴링합니다. 컴포넌트를 마운트 해제하면 타이머를 정리합니다. 네이티브 이벤트를 구독하거나 즉시 알림을 보장하지는 않습니다.

**제공하는 기능**:

- 컴포넌트 마운트 해제 시 자동 정리
- 기기 상태 변화에 따른 화면 갱신
- 익숙한 React 훅 패턴
- 기본 TypeScript 지원

## 설치 {#installation}

훅은 `react-native-nitro-device-info`에 포함됩니다.

```bash
# npm
npm install react-native-nitro-device-info react-native-nitro-modules

# yarn
yarn add react-native-nitro-device-info react-native-nitro-modules

# Don't forget pod install for iOS
cd ios && pod install
```

## 갱신 간격과 초기값 {#update-intervals-and-initial-values}

| 패키지 루트의 훅 | 폴링 간격 | 초기값 또는 조회 불가 값 |
| --- | --- | --- |
| `useBatteryLevel()` | 5초 | `null` |
| `useBatteryLevelIsLow()` | 2초 | `null`. 배터리가 부족하지 않을 때도 반환합니다. |
| `usePowerState()` | 5초 | 처음에는 `{}`. `batteryLevel`은 `-1`일 수 있습니다. |
| 헤드폰 훅 | 1초 | 처음에는 `false` |
| `useBrightness()` | 500밀리초 | 처음에는 `null`. Android에서는 `-1` |

타이머는 JavaScript 스케줄링에 의존하며 백그라운드에서 지연될 수 있습니다. 상태가 바뀐 순간에 훅의 반환값이 바뀌는 것은 아닙니다.

예제에서는 패키지 루트에서 훅을 import합니다. `/compat`의 헤드폰 훅은 `{ loading, result }`를 반환합니다. [마이그레이션 가이드](/api/migration)를 참고하세요.

## 간단한 예제 {#quick-examples}

### 배터리 관찰 {#battery-monitoring}

배터리 잔량에 따라 자동으로 다시 렌더링합니다.

```tsx
import { useBatteryLevel, usePowerState } from 'react-native-nitro-device-info';

function BatteryWidget() {
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();

  return (
    <View style={styles.widget}>
      <Text style={styles.label}>Battery</Text>
      <Text style={styles.value}>
        {batteryLevel !== null
          ? `${Math.round(batteryLevel * 100)}%`
          : 'Loading or unavailable'}
      </Text>
      <Text style={styles.status}>
        {powerState.batteryState === 'charging' ? '⚡ Charging' : '🔋 On Battery'}
      </Text>
    </View>
  );
}
// Note: styles (widget, label, value, status) need to be defined in a StyleSheet
```

### 배터리 부족 알림 {#low-battery-alerts}

배터리가 부족할 때 경고를 표시합니다.

```tsx
import { useBatteryLevelIsLow } from 'react-native-nitro-device-info';

function LowBatteryAlert() {
  const lowBattery = useBatteryLevelIsLow();

  // Only renders when battery is below threshold
  if (lowBattery === null) {
    return null;
  }

  return (
    <View style={styles.alert}>
      <Text style={styles.alertText}>
        ⚠️ Low Battery: {Math.round(lowBattery * 100)}%
      </Text>
      <Text style={styles.alertHint}>
        Please connect your charger
      </Text>
    </View>
  );
}
// Note: styles (alert, alertText, alertHint) need to be defined in a StyleSheet
```

### 헤드폰 감지 {#headphone-detection}

오디오 출력에 맞춰 UI를 바꿉니다.

```tsx
import {
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected
} from 'react-native-nitro-device-info';

function AudioOutputIndicator() {
  const anyHeadphones = useIsHeadphonesConnected();
  const wiredHeadphones = useIsWiredHeadphonesConnected();
  const bluetoothHeadphones = useIsBluetoothHeadphonesConnected();

  const getOutputIcon = () => {
    if (bluetoothHeadphones) return '🎧 Bluetooth';
    if (wiredHeadphones) return '🔌 Wired';
    return '🔊 Speaker';
  };

  return (
    <View style={styles.indicator}>
      <Text>{getOutputIcon()}</Text>
    </View>
  );
}
```

### 밝기 관찰(iOS) {#brightness-monitoring-ios}

화면 밝기 변화를 확인합니다.

```tsx
import { useBrightness } from 'react-native-nitro-device-info';
import { Platform } from 'react-native';

function BrightnessDisplay() {
  const brightness = useBrightness();

  if (Platform.OS === 'android') {
    return <Text>Brightness monitoring is iOS only</Text>;
  }

  if (brightness === null) {
    return <Text>Loading...</Text>;
  }

  return (
    <View>
      <Text>Brightness: {Math.round(brightness * 100)}%</Text>
      <View
        style={[
          styles.brightnessBar,
          { width: `${brightness * 100}%` }
        ]}
      />
    </View>
  );
}
// Note: styles.brightnessBar needs to be defined in a StyleSheet
```

## 전체 예제: 기기 상태 대시보드 {#complete-example-device-monitor-dashboard}

```tsx
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import {
  useBatteryLevel,
  usePowerState,
  useBatteryLevelIsLow,
  useIsHeadphonesConnected,
  useIsWiredHeadphonesConnected,
  useIsBluetoothHeadphonesConnected,
  useBrightness,
} from 'react-native-nitro-device-info';

export function DeviceMonitorDashboard() {
  // Battery hooks
  const batteryLevel = useBatteryLevel();
  const powerState = usePowerState();
  const lowBattery = useBatteryLevelIsLow();

  // Headphone hooks
  const headphones = useIsHeadphonesConnected();
  const wiredHeadphones = useIsWiredHeadphonesConnected();
  const bluetoothHeadphones = useIsBluetoothHeadphonesConnected();

  // Display hooks
  const brightness = useBrightness();

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Device Monitor</Text>

      {/* Battery Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔋 Battery</Text>
        <Row label="Level" value={formatPercent(batteryLevel)} />
        <Row label="State" value={powerState.batteryState ?? 'unknown'} />
        <Row label="Low Power Mode" value={powerState.lowPowerMode ? 'Yes' : 'No'} />
        {lowBattery !== null && (
          <View style={styles.warning}>
            <Text style={styles.warningText}>⚠️ Low Battery!</Text>
          </View>
        )}
      </View>

      {/* Audio Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎧 Audio Output</Text>
        <Row label="Any Headphones" value={headphones ? 'Connected' : 'Disconnected'} />
        <Row label="Wired" value={wiredHeadphones ? 'Yes' : 'No'} />
        <Row label="Bluetooth" value={bluetoothHeadphones ? 'Yes' : 'No'} />
      </View>

      {/* Display Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Display</Text>
        <Row
          label="Brightness"
          value={brightness !== null && brightness >= 0
            ? formatPercent(brightness)
            : 'N/A'
          }
        />
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

function formatPercent(value: number | null): string {
  if (value === null) return 'Loading...';
  return `${Math.round(value * 100)}%`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  section: {
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  label: {
    fontWeight: '500',
  },
  value: {
    color: '#666',
  },
  warning: {
    backgroundColor: '#fff3cd',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  warningText: {
    color: '#856404',
  },
});
```

## 문제 해결 {#troubleshooting}

### 훅이 계속 null을 반환하는 경우 {#hook-returns-null-indefinitely}

네이티브 모듈이 올바르게 연결됐는지 확인하세요.

```tsx
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// Debug: check if module is available
console.log('DeviceInfoModule:', DeviceInfoModule);
```

### 기기 상태가 바뀌어도 화면이 갱신되지 않는 경우 {#updates-not-received}

훅의 값이 갱신되지 않으면 앱이 포그라운드에 있는지 확인하세요.

### 밝기가 -1인 경우 {#brightness-returns--1}

Android에서 예상되는 동작입니다. 밝기를 확인하는 훅은 iOS만 지원합니다.

## 관련 문서 {#see-also}

- [훅 API 레퍼런스](/api/hooks): 전체 훅 시그니처와 타입
- [마이그레이션 가이드](/api/migration): react-native-device-info에서 전환
- [기본 사용 예제](/examples/basic-usage): 추가 사용법
