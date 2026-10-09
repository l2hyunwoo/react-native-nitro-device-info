---
translationOf: api/migration.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# 마이그레이션 가이드 {#migration-guide}

`react-native-device-info`에서 `react-native-nitro-device-info`로 전환하는 방법입니다.

## 개요 {#overview}

`react-native-nitro-device-info`는 `react-native-device-info`(RNDI) 15.x와 같은 함수 이름, 시그니처, 기본 `DeviceInfo` 객체, 훅을 제공하는 **호환 계층**을 포함합니다. `react-native-device-info` 대신 `react-native-nitro-device-info/compat`에서 가져오면 **호출 코드는 유지할 수 있습니다**.

바꾸려는 범위에 따라 두 경로 중 하나를 선택하세요.

| 경로 | 작업량 | 결과 |
| --- | --- | --- |
| **호환 경로(권장)** | 명령 하나로 가져오기만 변경 | 호출 코드 유지. 대체 값과 플랫폼 차이는 확인해야 합니다. |
| **네이티브 경로(선택)** | 호출 코드 수동 변경 | 직접 속성 접근과 동기 getter 사용 |

호환 경로부터 시작하세요. 필요하면 나중에 개별 호출을 네이티브 API로 옮길 수 있습니다. 두 API를 함께 사용할 수 있습니다.

## 호환 경로 마이그레이션(권장) {#drop-in-migration-recommended}

### 1. 설치 {#1-install}

```bash
# Install the new library + its peer dependency
npm install react-native-nitro-device-info react-native-nitro-modules
# (or: yarn add react-native-nitro-device-info react-native-nitro-modules)

# iOS
cd ios && pod install && cd ..
```

### 2. codemod 실행 {#2-run-the-codemod}

라이브러리에 포함된 codemod는 모든 `react-native-device-info` 가져오기를 `react-native-nitro-device-info/compat`으로 바꿉니다. **가져오기 지정자만 수정**하며 호출 코드는 바꾸지 않습니다.

```bash
npx react-native-nitro-device-info migrate
# or target a specific directory:
npx react-native-nitro-device-info migrate src
```

ES 가져오기(기본, 이름, 네임스페이스), 다시 내보내기, CommonJS `require()`를 바꿉니다.

```typescript
// Before
import DeviceInfo from 'react-native-device-info';
import { getModel, useBatteryLevel } from 'react-native-device-info';

// After (rewritten automatically — call sites unchanged)
import DeviceInfo from 'react-native-nitro-device-info/compat';
import { getModel, useBatteryLevel } from 'react-native-nitro-device-info/compat';
```

수동으로 작업한다면 프로젝트 전체에서 가져오기 문자열 `'react-native-device-info'`를 `'react-native-nitro-device-info/compat'`으로 바꿔도 같은 결과를 얻습니다.

### 3. 이전 의존성 제거 {#3-remove-the-old-dependency}

```bash
npm uninstall react-native-device-info
```

### 4. 문서의 주의 사항 확인 {#4-review-the-documented-caveats}

호환 계층은 **RNDI 15.x API**를 대상으로 합니다. 이 라이브러리에 네이티브 대응 기능이 없는 일부 API는 대체 값을 반환합니다. 아래 [호환 계층 주의 사항](#compat-layer-caveats)을 확인하세요. 앱에서 이 API를 쓰지 않으면 전환이 완료됩니다.

호출 코드를 바꾸거나 `await`를 추가·제거할 필요가 없습니다.

## 호환 계층 주의 사항 {#compat-layer-caveats}

호환 계층은 다음 예외를 포함해 RNDI 전체 API의 시그니처에 맞춥니다.

| API | 호환 계층 동작 | 이유 |
| --- | --- | --- |
| `getInstanceId()` / `getInstanceIdSync()` | `'unknown'` 반환 | RNDI에서 사용 중단 예정입니다(Firebase/GMS Instance ID 제거 예정). 네이티브 대응 기능이 없습니다. |
| `getAppSetId()` | `{ id: 'unknown', scope: -1 }` 반환 | 선택 의존성 Play Services App Set이 없을 때 RNDI가 반환하는 값과 같습니다. |
| `getUserAgentSync()` | `''` 반환 | 사용자 에이전트를 비동기로 계산합니다(iOS WebView). 실제 값은 비동기 `getUserAgent()`를 사용하세요. |
| `getInstallReferrerSync()` | `'unknown'` 반환 | 설치 리퍼러는 비동기로만 읽을 수 있습니다. `getInstallReferrer()`를 사용하세요. |

다른 API는 이 라이브러리의 네이티브 구현에 위임합니다. 플랫폼별 대체 값을 반환하거나 RNDI와 다르게 동작할 수 있습니다. 일부 결과 형태는 자동 변환합니다. 예를 들어 `getAvailableLocationProviders()`는 RNDI의 `{ gps: true, network: true }` 맵을 반환합니다. `getFreeDiskStorage(storageType?)`는 iOS 저장 공간 타입 인자를 받지만 무시합니다. 비동기 오디오 기기 훅은 RNDI의 `{ loading, result }` 형태를 반환합니다.

## 네이티브 경로 마이그레이션(선택, 직접 접근) {#native-migration-optional-for-maximum-performance}

호환 계층 대신 직접 속성 접근과 동기 getter를 사용하려면 패키지 루트에서 `DeviceInfoModule`을 가져오고 아래 표에 따라 호출 코드를 바꾸세요.

### 주요 차이 {#key-differences}

**구조**

- **react-native-device-info**: 설치한 릴리스에 따라 API와 구현이 다릅니다.
- **react-native-nitro-device-info**: Nitro HybridObject(JSI)를 사용합니다.

**속성과 메서드**: 대부분의 RNDI 메서드는 직접 읽는 속성으로 바뀝니다.

```typescript
// react-native-device-info        // native API
const deviceId = DeviceInfo.getDeviceId();   const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfo.getBrand();         const brand = DeviceInfoModule.brand;
```

**기본 동기 호출**: RNDI에서 비동기였던 값이 동기로 바뀝니다.

```typescript
const uniqueId = DeviceInfoModule.uniqueId;            // sync property
const totalMemory = DeviceInfoModule.totalMemory;       // sync property
const batteryLevel = DeviceInfoModule.getBatteryLevel(); // sync method
const isTablet = DeviceInfoModule.isTablet;             // sync property
```

**Promise 메서드는 여전히 `await`가 필요합니다**.

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
const installTime = await DeviceInfoModule.getFirstInstallTime();
```

### 빠른 대응표 {#quick-migration-reference}

### 기기 정보 {#device-information}

| react-native-device-info | `react-native-nitro-device-info` | 참고 |
| --- | --- | --- |
| `DeviceInfo.getDeviceId()` | `DeviceInfoModule.deviceId` | 속성으로 변경 |
| `DeviceInfo.getBrand()` | `DeviceInfoModule.brand` | 속성으로 변경 |
| `DeviceInfo.getModel()` | `DeviceInfoModule.model` | 속성으로 변경 |
| `DeviceInfo.getSystemName()` | `DeviceInfoModule.systemName` | 속성으로 변경 |
| `DeviceInfo.getSystemVersion()` | `DeviceInfoModule.systemVersion` | 속성으로 변경 |
| `await DeviceInfo.getUniqueId()` | `DeviceInfoModule.uniqueId` | 동기 속성으로 변경 |
| `DeviceInfo.getManufacturer()` | `DeviceInfoModule.manufacturer` | 속성으로 변경 |
| `DeviceInfo.isTablet()` | `DeviceInfoModule.isTablet` | 속성으로 변경 |

### 시스템 리소스 {#system-resources}

| react-native-device-info | `react-native-nitro-device-info` | 참고 |
| --- | --- | --- |
| `await DeviceInfo.getTotalMemory()` | `DeviceInfoModule.totalMemory` | 동기 속성으로 변경 |
| `await DeviceInfo.getUsedMemory()` | `DeviceInfoModule.getUsedMemory()` | 동기 메서드로 변경 |
| `await DeviceInfo.getTotalDiskCapacity()` | `DeviceInfoModule.totalDiskCapacity` | 동기 속성으로 변경 |
| `await DeviceInfo.getFreeDiskStorage()` | `DeviceInfoModule.getFreeDiskStorage()` | 동기 메서드로 변경 |

### 배터리 정보 {#battery-information}

| react-native-device-info | `react-native-nitro-device-info` | 참고 |
| --- | --- | --- |
| `await DeviceInfo.getBatteryLevel()` | `DeviceInfoModule.getBatteryLevel()` | 동기 메서드로 변경 |
| `await DeviceInfo.getPowerState()` | `DeviceInfoModule.getPowerState()` | 동기 메서드로 변경 |
| `await DeviceInfo.isBatteryCharging()` | `DeviceInfoModule.getIsBatteryCharging()` | 동기 메서드로 변경 |

### 앱 메타데이터 {#application-metadata}

| react-native-device-info | `react-native-nitro-device-info` | 참고 |
| --- | --- | --- |
| `DeviceInfo.getVersion()` | `DeviceInfoModule.version` | 속성으로 변경 |
| `DeviceInfo.getBuildNumber()` | `DeviceInfoModule.buildNumber` | 속성으로 변경 |
| `DeviceInfo.getBundleId()` | `DeviceInfoModule.bundleId` | 속성으로 변경 |
| `DeviceInfo.getApplicationName()` | `DeviceInfoModule.applicationName` | 속성으로 변경 |
| `DeviceInfo.getReadableVersion()` | `DeviceInfoModule.readableVersion` | 속성으로 변경 |

### 네트워크와 연결 {#network--connectivity}

| react-native-device-info | `react-native-nitro-device-info` | 참고 |
| --- | --- | --- |
| `await DeviceInfo.getIpAddress()` | `await DeviceInfoModule.getIpAddress()` | 비동기 유지(I/O) |
| `await DeviceInfo.getMacAddress()` | `await DeviceInfoModule.getMacAddress()` | 비동기 유지(I/O) |
| `await DeviceInfo.getCarrier()` | `await DeviceInfoModule.getCarrier()` | 비동기 유지(I/O) |
| `await DeviceInfo.isLocationEnabled()` | `await DeviceInfoModule.isLocationEnabled()` | 비동기 유지(I/O) |

### 단계별 절차(네이티브 경로) {#step-by-step-native-path}

> 네이티브 API로 전환하는 절차입니다. 호출 코드를 유지하려면 [호환 경로 마이그레이션](#drop-in-migration-recommended)을 사용하세요.

#### 1. 새 라이브러리 설치 {#1-install-the-new-library}

```bash
# Remove old library
npm uninstall react-native-device-info

# Install new library
npm install react-native-nitro-device-info react-native-nitro-modules

# iOS
cd ios && pod install && cd ..
```

#### 2. 가져오기 수정 {#2-update-imports}

코드 전체에서 가져오기를 찾아 바꾸세요.

```typescript
// Before
import DeviceInfo from 'react-native-device-info';

// After
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

#### 3. 모듈 이름 수정 {#3-update-module-name}

모든 `DeviceInfo` 참조를 `DeviceInfoModule`로 바꾸세요.

```typescript
// Before
const brand = DeviceInfo.getBrand();

// After
const brand = DeviceInfoModule.brand; // Also changed to property
```

#### 4. 메서드 호출을 속성으로 변환 {#4-convert-method-calls-to-properties}

속성으로 바뀐 메서드 호출을 수정하세요.

```typescript
// Before
const deviceId = DeviceInfo.getDeviceId();
const brand = DeviceInfo.getBrand();
const model = DeviceInfo.getModel();
const systemName = DeviceInfo.getSystemName();
const systemVersion = DeviceInfo.getSystemVersion();
const readableVersion = DeviceInfo.getReadableVersion();

// After
const deviceId = DeviceInfoModule.deviceId;
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const systemName = DeviceInfoModule.systemName;
const systemVersion = DeviceInfoModule.systemVersion;
const readableVersion = DeviceInfoModule.readableVersion;
```

#### 5. 불필요한 `await` 제거 {#5-remove-unnecessary-await-keywords}

동기로 바뀐 메서드의 `await`를 제거하세요.

```typescript
// Before
const uniqueId = await DeviceInfo.getUniqueId();
const totalMemory = await DeviceInfo.getTotalMemory();
const batteryLevel = await DeviceInfo.getBatteryLevel();

// After (no await needed, now sync properties/methods)
const uniqueId = DeviceInfoModule.uniqueId;
const totalMemory = DeviceInfoModule.totalMemory;
const batteryLevel = DeviceInfoModule.getBatteryLevel();
```

#### 6. 변경 테스트 {#6-test-your-changes}

앱을 실행하고 확인하세요.

- 모든 기기 정보 호출의 정상 동작
- 비동기·동기 변경으로 인한 런타임 오류 여부
- TypeScript 타입의 정확성

## 전체 예제 {#complete-example}

### 변경 전(react-native-device-info) {#before-react-native-device-info}

```typescript
import React, { useEffect, useState } from 'react';
import DeviceInfo from 'react-native-device-info';

function DeviceInfoScreen() {
  const [deviceId, setDeviceId] = useState('');
  const [brand, setBrand] = useState('');
  const [uniqueId, setUniqueId] = useState('');
  const [totalMemory, setTotalMemory] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState(0);
  const [ipAddress, setIpAddress] = useState('');

  useEffect(() => {
    async function loadDeviceInfo() {
      // Everything was async or method-based
      const id = DeviceInfo.getDeviceId();
      const b = DeviceInfo.getBrand();
      const uid = await DeviceInfo.getUniqueId();
      const mem = await DeviceInfo.getTotalMemory();
      const bat = await DeviceInfo.getBatteryLevel();
      const ip = await DeviceInfo.getIpAddress();

      setDeviceId(id);
      setBrand(b);
      setUniqueId(uid);
      setTotalMemory(mem);
      setBatteryLevel(bat);
      setIpAddress(ip);
    }

    loadDeviceInfo();
  }, []);

  return (
    <View>
      <Text>Device: {brand} {deviceId}</Text>
      <Text>Unique ID: {uniqueId}</Text>
      <Text>Memory: {totalMemory}</Text>
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
      <Text>IP: {ipAddress}</Text>
    </View>
  );
}
```

### 변경 후(`react-native-nitro-device-info`) {#after-react-native-nitro-device-info}

```typescript
import React, { useEffect, useState } from 'react';
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function DeviceInfoScreen() {
  const [ipAddress, setIpAddress] = useState('');

  // Sync properties/methods - instant access, no state needed
  const deviceId = DeviceInfoModule.deviceId;
  const brand = DeviceInfoModule.brand;
  const uniqueId = DeviceInfoModule.uniqueId;
  const totalMemory = DeviceInfoModule.totalMemory;
  const batteryLevel = DeviceInfoModule.getBatteryLevel();

  useEffect(() => {
    // Only async operations need useEffect
    DeviceInfoModule.getIpAddress().then(setIpAddress);
  }, []);

  return (
    <View>
      <Text>Device: {brand} {deviceId}</Text>
      <Text>Unique ID: {uniqueId}</Text>
      <Text>Memory: {totalMemory}</Text>
      <Text>Battery: {(batteryLevel * 100).toFixed(0)}%</Text>
      <Text>IP: {ipAddress}</Text>
    </View>
  );
}
```

## 마이그레이션의 이점 {#benefits-of-migration}

### 1. 성능 비교 {#1-performance-improvement}

```typescript
// react-native-device-info: model and brand already return synchronously.
const brand = DeviceInfo.getBrand();
const model = DeviceInfo.getModel();
const memory = await DeviceInfo.getTotalMemory();

// Native API: direct properties; measure latency in your app.
const brand = DeviceInfoModule.brand;
const model = DeviceInfoModule.model;
const memory = DeviceInfoModule.totalMemory;
```

### 2. 간단한 코드 {#2-simpler-code}

단순 getter에는 `async`/`await`가 필요하지 않습니다.

```typescript
// Old - required async function
async function getDeviceInfo() {
  const brand = DeviceInfo.getBrand();
  const model = DeviceInfo.getModel();
  return `${brand} ${model}`;
}

// New - direct access
function getDeviceInfo() {
  return `${DeviceInfoModule.brand} ${DeviceInfoModule.model}`;
}
```

### 3. TypeScript 지원 {#3-better-typescript-support}

전체 타입 정의와 IntelliSense를 제공합니다.

```typescript
import type { PowerState, BatteryState } from 'react-native-nitro-device-info';

const powerState: PowerState = DeviceInfoModule.getPowerState();
// TypeScript knows: powerState.batteryLevel, powerState.batteryState, powerState.lowPowerMode
```

### 4. 향후 지원을 위한 구조 {#4-future-proof-architecture}

장기 지원을 위해 React Native의 New Architecture(Fabric + JSI)를 기반으로 합니다.

## React 훅 마이그레이션 {#react-hooks-migration}

**호환 경로:** 모든 RNDI 훅을 같은 시그니처로 다시 내보냅니다. 비동기 훅의 `{ loading, result }` 형태도 포함합니다. codemod가 가져오기를 수정하며 사용법은 같습니다.

```tsx
// Before
import { useBatteryLevel, useDeviceName } from 'react-native-device-info';

// After (rewritten to the compat subpath — usage identical)
import { useBatteryLevel, useDeviceName } from 'react-native-nitro-device-info/compat';

function BatteryWidget() {
  const batteryLevel = useBatteryLevel();        // number | null
  const { result: name } = useDeviceName();       // AsyncHookResult<string>
  return <Text>{name}: {batteryLevel}</Text>;
}
```

**네이티브 경로:** 패키지 루트는 `AsyncHookResult` 래퍼 없이 값 자체를 반환하는 훅 7개를 직접 내보냅니다. 호출 코드를 네이티브 API로 옮길 때 사용하세요.

| react-native-device-info | 네이티브 루트 내보내기 | 참고 |
| --- | --- | --- |
| `useBatteryLevel()` | `useBatteryLevel()` | 동일(`number \| null`) |
| `useBatteryLevelIsLow()` | `useBatteryLevelIsLow()` | 동일 |
| `usePowerState()` | `usePowerState()` | 동일 |
| `useIsHeadphonesConnected()` | `useIsHeadphonesConnected()` | `boolean` 반환(호환 계층은 `{ loading, result }`로 감쌈) |
| `useIsWiredHeadphonesConnected()` | `useIsWiredHeadphonesConnected()` | `boolean` 반환(호환 계층은 래퍼 사용) |
| `useIsBluetoothHeadphonesConnected()` | `useIsBluetoothHeadphonesConnected()` | `boolean` 반환(호환 계층은 래퍼 사용) |
| `useBrightness()` | `useBrightness()` | 동일(`number \| null`) |

나머지 RNDI 훅(`useFirstInstallTime`, `useDeviceName`, `useHasSystemFeature`, `useIsEmulator`, `useManufacturer`)은 **호환 경로에서만** 제공하며 RNDI의 `AsyncHookResult<T>` 형태를 반환합니다.

전체 훅 설명은 [React 훅 가이드](/guide/react-hooks)를 참고하세요.

### 동작 변경(네이티브 경로 전용) {#behavioral-changes-native-path-only}

다음 차이는 **네이티브 API**(`DeviceInfoModule`)를 사용할 때 적용됩니다. 호환 계층은 함수 시그니처와 훅 결과 형태를 맞추지만 모든 플랫폼 동작을 재현하지는 않습니다. [호환 계층 주의 사항](#compat-layer-caveats)을 확인하세요.

1. **기본 동기 호출**: 대부분의 메서드는 더 이상 Promise를 반환하지 않습니다.
2. **속성 접근**: 일부 getter는 속성입니다.
3. **모듈 이름**: `DeviceInfo` 대신 `DeviceInfoModule`을 사용합니다.
4. **이벤트 리스너**: 원시 배터리·네트워크 상태 리스너를 내보내지 않습니다. 상태 관찰에는 제공하는 React 훅(`useBatteryLevel`, `usePowerState` 등)을 사용하세요. 호환 계층은 RNDI 훅을 같은 형태로 다시 내보냅니다.

## 문제 해결 {#troubleshooting}

### 마이그레이션 후 TypeScript 오류 {#typescript-errors-after-migration}

타입 오류가 발생하면 다음을 확인하세요.

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache
yarn install

# Restart TypeScript server in your IDE
```

### 런타임 오류 {#runtime-errors}

"Cannot read property" 오류가 발생하면 확인하세요.

1. 피어 의존성 `react-native-nitro-modules` 설치 여부
2. iOS의 `pod install` 실행 여부
3. 정리 후 빌드(`yarn android` / `yarn ios`)

### 메서드를 찾을 수 없는 경우 {#missing-methods}

1. [API 레퍼런스](/api/device-info)에서 정확한 메서드 이름을 확인하세요.
2. 일부 메서드는 이름이 바뀌거나 통합됐을 수 있습니다.
3. 필요한 메서드가 없으면 GitHub 이슈를 등록하세요.

---

## expo-device에서 마이그레이션 {#migrating-from-expo-device}

`expo-device`의 여러 API에 대응하는 API를 `react-native-nitro-device-info`에서 제공합니다.

### 주요 차이 {#key-differences-1}

| 항목 | expo-device | react-native-nitro-device-info |
| --- | --- | --- |
| 구조 | Expo Module API | Nitro Modules(JSI) |
| 동기/비동기 | 혼합(일부 비동기) | 대부분 동기 |
| Expo 의존성 | Expo 필요 | 일반 React Native에서 동작 |
| 성능 | 양호 | 직접 동기 접근. 앱에서 측정하세요. |

### API 대응표 {#api-migration-reference}

| expo-device | react-native-nitro-device-info | 참고 |
| --- | --- | --- |
| `Device.brand` | `DeviceInfoModule.brand` | 동일 |
| `Device.manufacturer` | `DeviceInfoModule.manufacturer` | 동일 |
| `Device.modelName` | `DeviceInfoModule.model` | 속성 이름 다름 |
| `Device.modelId` | `DeviceInfoModule.deviceId` | 속성 이름 다름 |
| `Device.designName` | `DeviceInfoModule.device` | Android 전용 |
| `Device.productName` | `DeviceInfoModule.product` | Android 전용 |
| `Device.deviceYearClass` | `DeviceInfoModule.deviceYearClass` | 동일 |
| `Device.totalMemory` | `DeviceInfoModule.totalMemory` | 동일 |
| `Device.supportedCpuArchitectures` | `DeviceInfoModule.supportedAbis` | Android 전용 |
| `Device.osName` | `DeviceInfoModule.systemName` | 속성 이름 다름 |
| `Device.osVersion` | `DeviceInfoModule.systemVersion` | 속성 이름 다름 |
| `Device.osBuildId` | `DeviceInfoModule.display` | Android 전용 |
| `Device.osInternalBuildId` | `DeviceInfoModule.fingerprint` | Android 전용 |
| `Device.osBuildFingerprint` | `DeviceInfoModule.fingerprint` | Android 전용 |
| `Device.platformApiLevel` | `DeviceInfoModule.apiLevel` | Android 전용 |
| `Device.deviceName` | `DeviceInfoModule.deviceName` | 동일 |
| `Device.DeviceType` | `DeviceInfoModule.deviceType` | 문자열 열거형 반환 |
| `Device.getDeviceTypeAsync()` | `DeviceInfoModule.deviceType` | 동기로 변경 |
| `Device.getUptimeAsync()` | `DeviceInfoModule.getUptime()` | 동기로 변경. 밀리초 반환 |
| `Device.isRootedExperimentalAsync()` | `DeviceInfoModule.isDeviceCompromised()` | 동기. 더 넓은 탐지 범위 |
| `Device.isSideLoadingEnabledAsync()` | `DeviceInfoModule.isSideLoadingEnabled()` | 동기로 변경. Android 전용 |

### 마이그레이션 예제 {#migration-example}

**변경 전**(`expo-device`):

```typescript
import * as Device from 'expo-device';

async function getDeviceInfo() {
  const deviceType = await Device.getDeviceTypeAsync();
  const isRooted = await Device.isRootedExperimentalAsync();
  const canSideload = await Device.isSideLoadingEnabledAsync();

  return {
    brand: Device.brand,
    model: Device.modelName,
    yearClass: Device.deviceYearClass,
    totalMemory: Device.totalMemory,
    deviceType,
    isRooted,
    canSideload,
  };
}
```

**변경 후**(`react-native-nitro-device-info`):

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getDeviceInfo() {
  // All synchronous - no async/await needed!
  return {
    brand: DeviceInfoModule.brand,
    model: DeviceInfoModule.model,
    yearClass: DeviceInfoModule.deviceYearClass,
    totalMemory: DeviceInfoModule.totalMemory,
    deviceType: DeviceInfoModule.deviceType,
    isRooted: DeviceInfoModule.isDeviceCompromised(),
    canSideload: DeviceInfoModule.isSideLoadingEnabled(),
  };
}
```

### 제공하지 않는 API {#apis-not-available}

다음 `expo-device` API에는 직접 대응하는 API가 없습니다.

| expo-device API | 대안 |
| --- | --- |
| `Device.isDevice` | `!DeviceInfoModule.isEmulator` 사용 |
| `Device.getPlatformFeaturesAsync()` | 미지원 |

### 플랫폼별 주의 사항 {#platform-specific-considerations}

#### 가동 시간 동작 {#uptime-behavior}

iOS의 `getUptime()`은 앱 이벤트 시간 측정에만 지원합니다. 경과 시간 측정, 타이머, 또는 `startupTime`으로 앱 이벤트 uptime을 절대 타임스탬프로 변환하는 용도입니다. 원시 가동 시간과 부팅 타임스탬프는 일반 기기 정보 데이터에 포함하지 마세요. 선언한 목적과 전송 제한은 [iOS 개인정보 보호 매니페스트](../guide/getting-started.md#ios-privacy-manifest)를 참고하세요.

- **expo-device**: 깊은 절전을 제외한 가동 시간을 밀리초로 반환
- **react-native-nitro-device-info**: 깊은 절전을 제외한 가동 시간을 밀리초로 반환
  - iOS: `systemUptime` 사용
  - Android: `uptimeMillis()` 사용
  - 두 플랫폼 모두 expo-device와 같은 활성 시간 반환

#### 기기 연도 등급 {#device-year-class}

두 라이브러리는 RAM과 CPU 사양으로 기기 연도 등급을 계산하는 같은 Facebook 알고리즘을 사용합니다. 연도 등급은 하드웨어가 고급 사양으로 평가됐을 것으로 추정하는 연도입니다.

#### 루팅·탈옥 탐지 {#rootjailbreak-detection}

- **expo-device**: `isRootedExperimentalAsync()` — 실험적 기본 검사
- **react-native-nitro-device-info**: `isDeviceCompromised()` — 종합 검사
  - Android: su 바이너리, 루팅 앱, 시스템 속성, test-keys 검사
  - iOS: Cydia, 탈옥 파일, 샌드박스 탈출, 의심 경로 검사

---

## react-native-carrier-info에서 마이그레이션 {#migrating-from-react-native-carrier-info}

통신사 정보에 `react-native-carrier-info`를 사용하고 있다면 `react-native-nitro-device-info`로 통합할 수 있습니다.

### API 대응표 {#api-migration-reference-1}

| react-native-carrier-info | react-native-nitro-device-info | 참고 |
| --- | --- | --- |
| `await CarrierInfo.allowsVOIP()` | `DeviceInfoModule.carrierAllowsVOIP` | 동기 속성으로 변경 |
| `await CarrierInfo.carrierName()` | `DeviceInfoModule.getCarrierSync()` | 동기 메서드로 변경 |
| `await CarrierInfo.isoCountryCode()` | `DeviceInfoModule.carrierIsoCountryCode` | 동기 속성으로 변경 |
| `await CarrierInfo.mobileCountryCode()` | `DeviceInfoModule.mobileCountryCode` | 동기 속성으로 변경 |
| `await CarrierInfo.mobileNetworkCode()` | `DeviceInfoModule.mobileNetworkCode` | 동기 속성으로 변경 |
| `await CarrierInfo.mobileNetworkOperator()` | `DeviceInfoModule.mobileNetworkOperator` | 동기 속성으로 변경 |

### 마이그레이션 예제 {#migration-example-1}

**변경 전**(`react-native-carrier-info`):

```typescript
import CarrierInfo from 'react-native-carrier-info';

async function getCarrierDetails() {
  const carrierName = await CarrierInfo.carrierName();
  const allowsVOIP = await CarrierInfo.allowsVOIP();
  const isoCountryCode = await CarrierInfo.isoCountryCode();
  const mcc = await CarrierInfo.mobileCountryCode();
  const mnc = await CarrierInfo.mobileNetworkCode();
  const operator = await CarrierInfo.mobileNetworkOperator();

  return { carrierName, allowsVOIP, isoCountryCode, mcc, mnc, operator };
}
```

**변경 후**(`react-native-nitro-device-info`):

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

function getCarrierDetails() {
  // All synchronous - no async/await needed!
  return {
    carrierName: DeviceInfoModule.getCarrierSync(),
    allowsVOIP: DeviceInfoModule.carrierAllowsVOIP,
    isoCountryCode: DeviceInfoModule.carrierIsoCountryCode,
    mcc: DeviceInfoModule.mobileCountryCode,
    mnc: DeviceInfoModule.mobileNetworkCode,
    operator: DeviceInfoModule.mobileNetworkOperator,
  };
}
```

### 주요 이점 {#key-benefits}

1. **async/await 불필요**: 모든 통신사 속성은 동기입니다.
2. **단일 의존성**: 별도 carrier-info 패키지가 필요하지 않습니다.
3. **JSI 직접 접근**: Nitro Modules로 네이티브 코드에 접근합니다.
4. **통합 API**: 다른 80개 이상의 기기 속성과 통신사 정보를 함께 제공합니다.

### 플랫폼 참고 사항 {#platform-notes}

- **iOS**: `CTTelephonyNetworkInfo`와 `CTCarrier` API 사용
- **Android**: `TelephonyManager` API 사용
- **carrierAllowsVOIP**: iOS에서는 실제 값, Android에서는 대응 API가 없어 항상 `true`
- **빈 문자열**: SIM 카드가 없으면 모든 속성이 `""` 반환

## 도움이 필요한 경우 {#need-help}

- [전체 API 레퍼런스](/api/device-info)
- [타입 정의](/api/types)
- [예제](/examples/basic-usage)
- [GitHub 이슈](https://github.com/l2hyunwoo/react-native-nitro-device-info/issues)
