---
translationOf: api/device-info.md
sourceCommit: 3d53f125a194764ed27ccee3131d5dbc8abaf0ec
---

# DeviceInfo 모듈 {#deviceinfo-module}

DeviceInfo 모듈의 전체 API 문서입니다. API를 선택하기 전에 [지원 여부 배지 설명](/api/#availability-badges)을 읽으세요.

네이티브 빌드의 최소 버전은 iOS 15.1과 Android API 24입니다. 의존성은 더 높은 최소 버전을 요구할 수 있습니다. 웹용 entry point와 fallback 값은 v1.8.0에서 추가했습니다.

## import {#import}

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

---

## 기본 기기 정보(API 9개) {#core-device-information-9-apis}

기본 기기 정보를 직접 읽는 동기 속성입니다.

### `deviceId: string` {#deviceid-string}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기 모델 식별자입니다.

```typescript
const deviceId = DeviceInfoModule.deviceId;
// iOS: "iPhone14,2"
// Android: "SM-G998B"
```

### `brand: string` {#brand-string}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

기기 브랜드 또는 제조사 이름입니다.

```typescript
const brand = DeviceInfoModule.brand;
// iOS: "Apple"
// Android: "Samsung", "Google", "OnePlus", etc.
```

### `model: string` {#model-string}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

소비자에게 표시하는 기기 모델명입니다. 하드웨어 식별자를 읽기 쉬운 이름으로 변환하고 알 수 없는 기기는 일반 이름으로 표시합니다.

```typescript
const model = DeviceInfoModule.model;
// iOS: "iPhone 18 Pro", "iPhone Duo", "iPad Pro 11-inch (M5)"
// Android: Device-specific model name (e.g., "Pixel 7 Pro", "Galaxy S24")
```

### `systemName: string` {#systemname-string}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

운영체제 이름입니다.

```typescript
const systemName = DeviceInfoModule.systemName;
// iOS: "iOS" or "iPadOS"
// Android: "Android"
```

### `systemVersion: string` {#systemversion-string}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

운영체제 버전 문자열입니다.

```typescript
const systemVersion = DeviceInfoModule.systemVersion;
// iOS: "15.0", "16.2.1"
// Android: "12", "13", "14"
```

### `deviceType: DeviceType` {#devicetype-devicetype}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기 유형입니다.

```typescript
const deviceType = DeviceInfoModule.deviceType;
// "Handset" | "Tablet" | "Tv" | "Desktop" | "GamingConsole" | "unknown"
```

### `uniqueId: string` {#uniqueid-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기 식별자를 읽습니다.

```typescript
const uniqueId = DeviceInfoModule.uniqueId;
// iOS: IDFV (Identifier for Vendor)
// Android: ANDROID_ID
// Example: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
```

- **iOS**: 현재 IDFV를 읽으며 조회할 수 없으면 `""`를 반환합니다. 같은 공급업체의 모든 앱을 삭제한 뒤에도 유지된다고 가정하지 마세요.
- **Android**: ANDROID_ID를 읽으며 조회할 수 없으면 `""`를 반환합니다. 범위와 초기화 동작은 Android에 따라 다릅니다.

이 값을 영구 기기 식별자나 계정 식별자로 사용하지 마세요. [Apple IDFV](https://developer.apple.com/documentation/uikit/uidevice/identifierforvendor)와 [Android ANDROID_ID](https://developer.android.com/reference/android/provider/Settings.Secure#ANDROID_ID)를 참고하세요.

### `manufacturer: string` {#manufacturer-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

기기 제조사 이름을 읽습니다.

```typescript
const manufacturer = DeviceInfoModule.manufacturer;
// iOS: "Apple"
// Android: "Samsung", "Google", "Xiaomi", etc.
```

### `deviceName: string` {#devicename-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

사용자가 지정한 기기 이름을 읽습니다.

```typescript
const deviceName = DeviceInfoModule.deviceName;
// Example: "John's iPhone", "My Galaxy S21"
```

---

## 기기 기능(API 7개) {#device-capabilities-7-apis}

기기 기능과 하드웨어 사용 가능 여부를 불리언으로 확인합니다.

### `isTablet: boolean` {#istablet-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

태블릿인지 확인합니다.

```typescript
const isTablet = DeviceInfoModule.isTablet;
// iPad → true
// iPhone → false
```

- **iOS**: UIDevice.userInterfaceIdiom 기준
- **Android**: 최소 화면 너비 >= 600dp 기준

### `isEmulator: boolean` {#isemulator-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

시뮬레이터 또는 에뮬레이터에서 실행 중인지 확인합니다.

```typescript
const isEmulator = DeviceInfoModule.isEmulator;
```

### `deviceYearClass: number` {#deviceyearclass-number}

<span class="rp-badge rp-badge--tip">v1.4.2부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

하드웨어 사양으로 추정한 year class를 읽습니다.

```typescript
const yearClass = DeviceInfoModule.deviceYearClass;

if (yearClass >= 2020) {
  enableHighEndFeatures();
} else if (yearClass >= 2015) {
  enableStandardFeatures();
} else {
  enableLowEndFeatures();
}
```

기기의 하드웨어가 플래그십·고급 사양에 해당했을 것으로 추정하는 연도를 반환합니다. 2025년에 맞춰 확장한 Facebook device-year-class 알고리즘을 사용합니다.

**RAM → year class 대응**:

| RAM | year class | 기기 예시 |
|-----|------------|-----------------|
| ≤2 GB | 2013 | 보급형 |
| ≤4 GB | 2015 | 2015-2016년 중급형 |
| ≤6 GB | 2017 | 2017-2018년 플래그십 |
| ≤8 GB | 2019 | 2019-2020년 플래그십 |
| ≤12 GB | 2021 | 2021-2022년 플래그십 |
| ≤16 GB | 2023 | 2023-2024년 플래그십 |
| >16 GB | 2025 | 최신 플래그십 |

### `isCameraPresent: boolean` {#iscamerapresent-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (v1.9.0부터)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS 구현은 v1.9.0부터 사용할 수 있습니다. v1.8.3까지의 배포 버전은 항상 `true`를 반환합니다. [구현 변경](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/be976f0)을 참고하세요.

카메라 하드웨어가 있는지 확인합니다. iOS 시뮬레이터나 영상 캡처 기기가 없을 때는 `false`를 반환합니다. 카메라 권한을 요청하지 않으며, `true`라고 해서 앱에 영상 촬영 권한이 있다는 뜻은 아닙니다.

```typescript
const hasCamera = DeviceInfoModule.isCameraPresent;
```

### `isPinOrFingerprintSet: boolean` {#ispinorfingerprintset-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (v1.9.0부터)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS 구현은 v1.9.0부터 사용할 수 있습니다. v1.8.3까지의 배포 버전은 항상 `false`를 반환합니다. [구현 변경](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/801903e)을 참고하세요.

PIN, 지문 또는 Face ID를 설정했는지 확인합니다. iOS에서는 기기 소유자를 인증할 수 있는지 확인합니다. 생체 인증을 사용할 수 없거나 잠겨 있어 기기 암호로 인증하는 경우도 포함합니다. 암호를 설정하지 않았으면 `false`를 반환합니다. 사용자를 인증하거나 인증 창을 표시하지 않으며, 읽을 때마다 다시 검사합니다.

```typescript
const isSecure = DeviceInfoModule.isPinOrFingerprintSet;
```

### `isHardwareKeyStoreAvailable: boolean` {#ishardwarekeystoreavailable-boolean}

<span class="rp-badge rp-badge--tip">v1.2.1부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: 제한적 지원</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

플랫폼 키 저장소를 사용할 수 있는지 확인합니다. Android에서는 키를 하드웨어로 보호하는지 검증하지 않습니다.

```typescript
const hasHardwareKeyStore = DeviceInfoModule.isHardwareKeyStoreAvailable;

if (hasHardwareKeyStore) {
  console.log('Platform key-storage check passed');
  // Apply your key-storage policy; this check alone is not a security guarantee.
} else {
  console.log('Platform key storage unavailable');
  // Use alternative security measures
}
```

**플랫폼 제한**: iOS는 Secure Enclave 사용 가능 여부를 확인합니다. Android는 `AndroidKeyStore`를 열 수 있는지만 확인하므로 키가 하드웨어로 보호된다는 증거가 아닙니다.

### `isLowRamDevice: boolean` {#islowramdevice-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

RAM이 적은 기기로 분류되는지 확인합니다.

```typescript
const isLowRam = DeviceInfoModule.isLowRamDevice;
// Android API 19+: true/false
// iOS: false
```

**플랫폼**: Android. OS 분류 API는 API 19부터 있지만 이 패키지는 API 24 이상이 필요합니다.

---

## 디스플레이와 화면(API 7개) {#display--screen-7-apis}

화면과 디스플레이 정보입니다.

### `getHasNotch(): boolean` {#gethasnotch-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

화면에 노치가 있는지 확인합니다.

```typescript
const hasNotch = DeviceInfoModule.getHasNotch();
// iPhone X, 11, 12, 13 → true
// iPhone SE, 8 → false
```

- **iOS 전용**: iPhone X 이후 모델을 감지합니다.
- **Android**: 항상 `false`를 반환합니다.

### `getHasDynamicIsland(): boolean` {#gethasdynamicisland-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 16+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Dynamic Island가 있는지 확인합니다.

```typescript
const hasDynamicIsland = DeviceInfoModule.getHasDynamicIsland();
// iPhone 14 Pro, 15 Pro → true
// iPhone 14, 13 → false
```

- **iOS 16 이상 전용**: iPhone 14 Pro 이후
- **Android**: 항상 `false`를 반환합니다.

### `isDisplayZoomed: boolean` {#isdisplayzoomed-boolean}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS 디스플레이 확대가 켜져 있는지 확인합니다.

```typescript
const isZoomed = DeviceInfoModule.isDisplayZoomed;
// iOS: true/false based on display zoom setting
// Android: false
```

**플랫폼**: iOS 전용

### `getIsLandscape(): boolean` {#getislandscape-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

기기가 가로 방향인지 확인합니다.

```typescript
const isLandscape = DeviceInfoModule.getIsLandscape();
```

### `getBrightness(): number` {#getbrightness-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

현재 화면 밝기를 읽습니다(0.0~1.0).

```typescript
const brightness = DeviceInfoModule.getBrightness();
console.log(`Brightness: ${(brightness * 100).toFixed(0)}%`);
// iOS: 0.0 to 1.0
// Android: -1
```

**플랫폼**: iOS 전용

### `getFontScale(): number` {#getfontscale-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

현재 글꼴 배율을 읽습니다.

```typescript
const fontScale = DeviceInfoModule.getFontScale();
// Example: 1.0 (normal), 1.2 (large), 0.85 (small)
```

### `isLiquidGlassAvailable: boolean` {#isliquidglassavailable-boolean}

<span class="rp-badge rp-badge--tip">v1.2.1부터</span> <span class="rp-badge rp-badge--info">iOS 26+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기에서 Liquid Glass 효과를 사용할 수 있는지 확인합니다.

```typescript
const hasLiquidGlass = DeviceInfoModule.isLiquidGlassAvailable;

if (hasLiquidGlass) {
  console.log('Liquid glass effect available');
  // Can use new iOS 26+ design features
} else {
  console.log('Liquid glass not available');
  // Fallback to standard UI
}
```

**플랫폼**: iOS 26.0 이상

Swift 6.2 이상 컴파일러가 필요합니다. 이전 컴파일러로 빌드하거나 `UIDesignRequiresCompatibility`를 켜면 `false`를 반환합니다.

---

## 시스템 리소스(API 7개) {#system-resources-7-apis}

메모리, 저장 공간, 가동 시간 정보입니다.

### `totalMemory: number` {#totalmemory-number}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

기기 전체 RAM을 바이트로 읽습니다.

```typescript
const totalMemory = DeviceInfoModule.totalMemory;
// Example: 6442450944 (6 GB)
console.log(`Total RAM: ${(totalMemory / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUsedMemory(): number` {#getusedmemory-number}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

현재 앱의 메모리 사용량을 바이트로 읽습니다.

```typescript
const usedMemory = DeviceInfoModule.getUsedMemory();
// Example: 134217728 (128 MB)
console.log(`Used Memory: ${(usedMemory / 1024 / 1024).toFixed(0)}MB`);
```

### `maxMemory: number` {#maxmemory-number}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

앱이 사용할 수 있는 최대 메모리를 바이트로 읽습니다.

```typescript
const maxMemory = DeviceInfoModule.maxMemory;
// Android: max heap size
// iOS: -1
```

**플랫폼**: Android 전용

### `totalDiskCapacity: number` {#totaldiskcapacity-number}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

전체 내부 저장 공간을 바이트로 읽습니다.

```typescript
const totalDisk = DeviceInfoModule.totalDiskCapacity;
// Example: 128849018880 (120 GB)
console.log(`Total Storage: ${(totalDisk / 1024 / 1024 / 1024).toFixed(0)}GB`);
```

### `getFreeDiskStorage(): number` {#getfreediskstorage-number}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

남은 저장 공간을 바이트로 읽습니다.

```typescript
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
// Example: 51539607552 (48 GB)
console.log(`Free Storage: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUptime(): number` {#getuptime-number}

<span class="rp-badge rp-badge--tip">v1.4.2부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

깊은 절전 시간을 제외한 부팅 후 기기 가동 시간을 밀리초로 읽습니다.

iOS에서는 앱 이벤트의 시간 측정에만 사용하세요. 경과 시간이나 타이머(`35F9.1`), 또는 `startupTime`으로 앱 이벤트의 uptime을 절대 타임스탬프로 변환하는 용도(`8FFB.1`)입니다. 원시 가동 시간을 일반 기기 정보로 표시·수집하거나 기기 밖으로 전송하거나 핑거프린팅에 사용하지 마세요. 앱 이벤트 사이의 경과 시간 또는 변환한 앱 이벤트의 절대 타임스탬프만 기기 밖으로 전송할 수 있습니다.

```typescript
const startedAt = DeviceInfoModule.getUptime();
const usedMemory = DeviceInfoModule.getUsedMemory();
const elapsedMs = DeviceInfoModule.getUptime() - startedAt;
console.log({ usedMemory, elapsedMs });
```

**플랫폼 동작**:
- **iOS**: `systemUptime` 사용(깊은 절전 제외)
- **Android**: `uptimeMillis()` 사용(깊은 절전 제외)

두 플랫폼 모두 부팅 후의 활성 시간을 반환하며 `expo-device.getUptimeAsync()`의 동작과 같습니다.

### `startupTime: number` {#startuptime-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기 부팅 시각을 읽습니다(epoch 이후 밀리초).

iOS에서는 앱 이벤트의 uptime을 절대 타임스탬프로 변환하는 기준 시각으로만 사용하세요(`8FFB.1`). 원시 부팅 타임스탬프를 일반 기기 정보로 표시·수집하거나 기기 밖으로 전송하거나 핑거프린팅에 사용하지 마세요. 변환한 앱 내 이벤트의 절대 타임스탬프만 기기 밖으로 전송할 수 있습니다.

```typescript
// iOS: capture an event occurring in the app using the same uptime clock.
const eventUptime = DeviceInfoModule.getUptime();
const eventTimestamp = DeviceInfoModule.startupTime + eventUptime;
console.log(`App event at: ${new Date(eventTimestamp).toISOString()}`);
```

앱 시작 시각이 아니라 기기 부팅 시각입니다. 지원 목적과 Apple의 사용 제한은 [iOS privacy info manifest](../guide/getting-started.md#ios-privacy-manifest)를 참고하세요.

---

## 배터리와 전원(API 4개) {#battery--power-4-apis}

배터리와 전원 상태 정보입니다.

### `getBatteryLevel(): number` {#getbatterylevel-number}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

현재 배터리 잔량(0.0~1.0)을 읽으며 조회할 수 없으면 `-1`을 반환합니다. 배터리가 빈 상태임을 확인하면 `0`을 반환합니다.

웹에서는 첫 비동기 요청이 resolve된 뒤 배터리 getter가 같은 BatteryManager 객체에서 현재 값을 읽습니다.
요청이 resolve되기 전이거나 API가 없거나 요청이 reject된 경우,
잔량은 `-1`, 충전 여부는 `false`, 배터리 상태는 `"unknown"`이며
`isLowBatteryLevel()`은 `false`를 반환합니다.

```typescript
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(batteryLevel * 100).toFixed(0)}%`);
// Output: "Battery: 75%"
```

### `getPowerState(): PowerState` {#getpowerstate-powerstate}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android API 24+: 제한적 지원</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

Android에서 `lowPowerMode`는 항상 `false`입니다. 배터리 잔량과 충전 상태는 실제 값을 읽습니다.

전체 전원 상태를 읽습니다.

```typescript
const powerState = DeviceInfoModule.getPowerState();
console.log(powerState.batteryLevel < 0
  ? 'Battery: unavailable'
  : `Battery: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`Status: ${powerState.batteryState}`);
console.log(`Low Power Mode: ${powerState.lowPowerMode}`); // iOS only
```

**PowerState** 인터페이스:

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 to 1.0, or -1 if unavailable
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS only
}
```

### `getIsBatteryCharging(): boolean` {#getisbatterycharging-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

배터리를 충전 중인지 확인합니다.

```typescript
const isCharging = DeviceInfoModule.getIsBatteryCharging();
```

### `isLowBatteryLevel(threshold: number): boolean` {#islowbatterylevelthreshold-number-boolean}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

유효한 배터리 잔량이 임계값보다 낮은지 확인합니다. 조회할 수 없으면 `false`를 반환합니다. 확인한 잔량이 `0%`라면 부족한 상태로 판단합니다.

```typescript
const isLowBattery = DeviceInfoModule.isLowBatteryLevel(0.2); // 20%
if (isLowBattery) {
  console.log('Battery is low, please charge');
}
```

---

## 앱 메타데이터(API 9개) {#application-metadata-9-apis}

앱 번들과 버전 정보입니다.

### `version: string` {#version-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

앱 버전 문자열을 읽습니다.

```typescript
const version = DeviceInfoModule.version;
// Example: "1.2.3"
```

### `buildNumber: string` {#buildnumber-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

앱 빌드 번호를 읽습니다.

```typescript
const buildNumber = DeviceInfoModule.buildNumber;
// Example: "42" or "20231025"
```

### `bundleId: string` {#bundleid-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

번들 ID(iOS) 또는 패키지 이름(Android)을 읽습니다.

```typescript
const bundleId = DeviceInfoModule.bundleId;
// Example: "com.company.app"
```

### `applicationName: string` {#applicationname-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

앱 표시 이름을 읽습니다.

```typescript
const appName = DeviceInfoModule.applicationName;
// Example: "My Awesome App"
```

### `readableVersion: string` {#readableversion-string}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

읽기 쉬운 버전 문자열(version.buildNumber)을 읽습니다.

```typescript
const readableVersion = DeviceInfoModule.readableVersion;
// Example: "1.2.3.42"
```

### `getFirstInstallTime(): Promise<number>` {#getfirstinstalltime-promisenumber}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: 제한적 지원</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서는 Documents 디렉터리 생성 시각으로 설치 시각을 추정합니다. 조회할 수 없으면 `0`을 반환합니다.

앱 최초 설치 시각을 읽습니다(epoch 이후 밀리초).

```typescript
const installTime = await DeviceInfoModule.getFirstInstallTime();
const installDate = new Date(installTime);
console.log(`Installed: ${installDate.toLocaleDateString()}`);
```


### `getLastUpdateTime(): Promise<number>` {#getlastupdatetime-promisenumber}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: 제한적 지원</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

가장 최근 앱 갱신 시각을 읽습니다(epoch 이후 밀리초).

```typescript
const updateTime = await DeviceInfoModule.getLastUpdateTime();
const updateDate = new Date(updateTime);
console.log(`Last Updated: ${updateDate.toLocaleDateString()}`);
```

**iOS 제한**: App Store 업데이트 시각이 아닌 Documents 디렉터리 수정 시각을 읽습니다. 조회할 수 없으면 `0`을 반환합니다.

### `firstInstallTimeSync: number` {#firstinstalltimesync-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS 15.1+: 제한적 지원</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서는 처음 접근할 때 Documents 디렉터리 생성 시각을 캐시합니다. 조회할 수 없으면 `0`을 반환합니다.

`getFirstInstallTime()`의 동기 버전입니다.

```typescript
const firstInstallTimeSync = DeviceInfoModule.firstInstallTimeSync;
```

### `lastUpdateTimeSync: number` {#lastupdatetimesync-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

동기 버전입니다(iOS에서는 -1 반환).

```typescript
const lastUpdateTimeSync = DeviceInfoModule.lastUpdateTimeSync;
```

---

## 네트워크(API 6개) {#network-6-apis}

통신사를 제외한 네트워크 연결 API입니다.

### `getIpAddress(): Promise<string>` {#getipaddress-promisestring}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

기기의 로컬 IP 주소를 읽습니다.

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
// Example: "192.168.1.100", "10.0.0.5"
```


### `getIpAddressSync(): string` {#getipaddresssync-string}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

동기 버전입니다(5초 캐시 사용).

```typescript
const ipAddressSync = DeviceInfoModule.getIpAddressSync();
```

### `getMacAddress(): Promise<string>` {#getmacaddress-promisestring}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Android에서 접근을 허용하면 Wi-Fi MAC 주소를 읽습니다. `getMacAddressSync()`와 같은 5초 캐시를 사용하며 조회할 수 없으면 `"unknown"`을 반환합니다. 최신 Android에서 [일반 앱은 대개 하드웨어 MAC 주소에 접근할 수 없습니다](https://developer.android.com/reference/java/net/NetworkInterface#getHardwareAddress()). 이 API는 제한을 우회하지 않습니다.

```typescript
const macAddress = await DeviceInfoModule.getMacAddress();
// iOS: "02:00:00:00:00:00" (hardcoded since iOS 7 for privacy)
// Android: "unknown" when restricted, otherwise the available wlan0 MAC
```


### `getMacAddressSync(): string` {#getmacaddresssync-string}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Android에서 같은 방식으로 조회하는 동기 버전입니다. 5초 캐시와 `"unknown"` fallback 값도 공유합니다.

```typescript
const macAddressSync = DeviceInfoModule.getMacAddressSync();
```

### `getUserAgent(): Promise<string>` {#getuseragent-promisestring}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

HTTP User-Agent 문자열을 읽습니다.

```typescript
const userAgent = await DeviceInfoModule.getUserAgent();
// Example: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ..."
```

iOS는 WebView를 초기화하고 처음 성공한 결과를 캐시합니다. Android는 `WebSettings`를 비동기로 조회합니다. 두 플랫폼 모두 `Promise<string>`을 반환합니다.

### `getIsAirplaneMode(): boolean` {#getisairplanemode-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

비행기 모드가 켜져 있는지 확인합니다.

웹에서는 브라우저가 비행기 모드를 판단할 수 없으므로 항상 `false`를 반환합니다.
오프라인이라는 사실만으로 비행기 모드가 켜졌다고 판단할 수는 없습니다.

```typescript
const isAirplaneMode = DeviceInfoModule.getIsAirplaneMode();
// Android: true/false
// iOS and web: false (not available)
```

**플랫폼**: Android 전용

---

## 통신사 정보(API 7개) {#carrier-information-7-apis}

통신 앱, 분석, 지역 판단에 사용하는 이동통신사 정보입니다.

### `getCarrier(): Promise<string>` {#getcarrier-promisestring}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (v1.8.0부터)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서 실제 값을 반환하는 구현은 v1.8.0부터 제공합니다. 이전 버전에서는 대응하는 동기 API가 구현되어 있어도 이 비동기 API는 고정 fallback 값을 반환합니다. [iOS 구현 변경](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026)을 참고하세요.

이동통신사 이름을 읽습니다.

```typescript
const carrier = await DeviceInfoModule.getCarrier();
// Example: "Verizon", "AT&T", "T-Mobile"
```


### `getCarrierSync(): string` {#getcarriersync-string}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

동기 버전입니다(5초 캐시 사용).

```typescript
const carrierSync = DeviceInfoModule.getCarrierSync();
```

### `carrierAllowsVOIP: boolean` {#carrierallowsvoip-boolean}

<span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

통신사가 네트워크에서 VoIP 통화를 허용하는지 확인합니다.

```typescript
const allowsVOIP = DeviceInfoModule.carrierAllowsVOIP;
// iOS: true/false based on carrier policy
// Android: always true (no equivalent API)
```

**플랫폼**: iOS 전용(Android에서는 항상 `true` 반환)

### `carrierIsoCountryCode: string` {#carrierisocountrycode-string}

<span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

통신사의 ISO 3166-1 alpha-2 국가 코드를 읽습니다.

```typescript
const countryCode = DeviceInfoModule.carrierIsoCountryCode;
// Example: "US", "KR", "JP", "DE"
// Returns "" if no SIM card
```

### `mobileCountryCode: string` {#mobilecountrycode-string}

<span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

ITU-T 권고 E.212에 따른 이동통신 국가 코드(MCC)를 읽습니다.

```typescript
const mcc = DeviceInfoModule.mobileCountryCode;
// Example: "310" (USA), "450" (Korea), "440" (Japan)
// Returns "" if no carrier
```

**주요 MCC 값**:

| 국가 | MCC |
|---------|-----|
| 미국 | 310-316 |
| 한국 | 450 |
| 일본 | 440-441 |
| 중국 | 460 |
| 독일 | 262 |

### `mobileNetworkCode: string` {#mobilenetworkcode-string}

<span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

국가 내 통신사를 구별하는 이동통신 네트워크 코드(MNC)를 읽습니다.

```typescript
const mnc = DeviceInfoModule.mobileNetworkCode;
// Example: "260" (T-Mobile US), "05" (SKT Korea)
// Returns "" if no carrier
```

### `mobileNetworkOperator: string` {#mobilenetworkoperator-string}

<span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

MCC + MNC를 합친 문자열을 읽습니다.

```typescript
const operator = DeviceInfoModule.mobileNetworkOperator;
// Example: "310260" (T-Mobile US), "45005" (SKT Korea)
// Equivalent to: mobileCountryCode + mobileNetworkCode
// Returns "" if no carrier
```

**활용 예**:
- 통신사별 기능 설정
- 지역별 콘텐츠 제공
- 통신 분석
- 부정 사용 탐지(지역 확인)

---

## 오디오 기기(API 4개) {#audio-accessories-4-apis}

오디오 기기를 감지합니다.

### `isHeadphonesConnected(): Promise<boolean>` {#isheadphonesconnected-promiseboolean}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (v1.8.0부터)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서 실제 값을 반환하는 구현은 v1.8.0부터 제공합니다. 이전 버전에서는 대응하는 동기 API가 구현되어 있어도 이 비동기 API는 고정 fallback 값을 반환합니다. [iOS 구현 변경](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026)을 참고하세요.

헤드폰 연결 여부를 확인합니다(유선 또는 Bluetooth). Android에서는 동기 getter와 같은 방식으로 출력 기기를 감지합니다.

```typescript
const hasHeadphones = await DeviceInfoModule.isHeadphonesConnected();
```


### `getIsHeadphonesConnected(): boolean` {#getisheadphonesconnected-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

동기 버전입니다.

```typescript
const isHeadphonesConnected = DeviceInfoModule.getIsHeadphonesConnected();
```

### `getIsWiredHeadphonesConnected(): boolean` {#getiswiredheadphonesconnected-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

유선 헤드폰 연결 여부를 확인합니다. Android에서는 유선 헤드폰·헤드셋과 [API 26 이상의 USB 헤드셋](https://developer.android.com/reference/android/media/AudioDeviceInfo#TYPE_USB_HEADSET)을 포함합니다. 내장 스피커와 Bluetooth 기기는 유선 헤드폰에 포함하지 않습니다.

```typescript
const hasWiredHeadphones = DeviceInfoModule.getIsWiredHeadphonesConnected();
```

### `getIsBluetoothHeadphonesConnected(): boolean` {#getisbluetoothheadphonesconnected-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Bluetooth 헤드폰 연결 여부를 확인합니다.

```typescript
const hasBluetoothHeadphones = DeviceInfoModule.getIsBluetoothHeadphonesConnected();
```

---

## 위치 서비스(API 3개) {#location-services-3-apis}

위치 provider 정보입니다.

### `isLocationEnabled(): Promise<boolean>` {#islocationenabled-promiseboolean}

<span class="rp-badge rp-badge--tip">v0.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+ (v1.8.0부터)</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서 실제 값을 반환하는 구현은 v1.8.0부터 제공합니다. 이전 버전에서는 대응하는 동기 API가 구현되어 있어도 이 비동기 API는 고정 fallback 값을 반환합니다. [iOS 구현 변경](https://github.com/l2hyunwoo/react-native-nitro-device-info/commit/cb6eb026)을 참고하세요.

위치 서비스가 켜져 있는지 확인합니다.

```typescript
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();
```


### `getIsLocationEnabled(): boolean` {#getislocationenabled-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

동기 버전입니다.

```typescript
const isLocationEnabled = DeviceInfoModule.getIsLocationEnabled();
```

### `getAvailableLocationProviders(): string[]` {#getavailablelocationproviders-string}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

활성화된 위치 provider 목록을 읽습니다.

```typescript
const providers = DeviceInfoModule.getAvailableLocationProviders();
// ["gps", "network"]
```

---

## 언어와 지역(API 1개) {#localization-1-api}

언어와 지역 설정입니다.

### `systemLanguage: string` {#systemlanguage-string}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: 제한적 지원</span>

기기 시스템 언어를 BCP 47 형식으로 읽습니다.

```typescript
const language = DeviceInfoModule.systemLanguage;
// iOS: "en-US", "ko-KR", "ja-JP", "zh-Hans-CN"
// Android: "en-US", "ko-KR", "ja-JP", "zh-Hans-CN"
```

**예시**:

| 언어 | 코드 |
|----------|------|
| 영어(미국) | `en-US` |
| 한국어 | `ko-KR` |
| 일본어 | `ja-JP` |
| 중국어 간체 | `zh-Hans-CN` |
| 프랑스어(프랑스) | `fr-FR` |
| 독일어 | `de-DE` |

**활용 예**:

```typescript
const language = DeviceInfoModule.systemLanguage;

if (language.startsWith('ko')) {
  console.log('Korean device detected');
} else if (language.startsWith('ja')) {
  console.log('Japanese device detected');
}
```

---

## CPU와 아키텍처(API 3개) {#cpu--architecture-3-apis}

프로세서와 ABI 정보입니다.

### `supportedAbis: string[]` {#supportedabis-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

지원 CPU 아키텍처를 읽습니다.

```typescript
const abis = DeviceInfoModule.supportedAbis;
// iOS: ["arm64"]
// Android: ["arm64-v8a", "armeabi-v7a"]
```

### `supported32BitAbis: string[]` {#supported32bitabis-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

지원하는 32비트 ABI 목록을 읽습니다.

```typescript
const abis32 = DeviceInfoModule.supported32BitAbis;
// iOS: []
// Android API 21+: ["armeabi-v7a", "x86"]
```

**플랫폼**: Android API 21 이상. iOS에서는 `[]` 반환

### `supported64BitAbis: string[]` {#supported64bitabis-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

지원하는 64비트 ABI 목록을 읽습니다.

```typescript
const abis64 = DeviceInfoModule.supported64BitAbis;
// iOS: ["arm64"]
// Android API 21+: ["arm64-v8a", "x86_64"]
```

---

## Android 플랫폼(API 20개 이상) {#android-platform-20-apis}

Android 전용 API와 빌드 정보입니다.

### `apiLevel: number` {#apilevel-number}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Android API 수준을 읽습니다.

```typescript
const apiLevel = DeviceInfoModule.apiLevel;
// Android 12 → 31
// Android 13 → 33
// iOS → -1
```

**플랫폼**: Android 전용

### `navigationMode: NavigationMode` {#navigationmode-navigationmode}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Android 내비게이션 방식을 읽습니다.

```typescript
const navMode = DeviceInfoModule.navigationMode;
// Android with gesture nav → "gesture"
// Android with 3-button nav → "buttons"
// Android with 2-button nav → "twobuttons"
// iOS → "unknown"
```

**타입**: `'gesture' | 'buttons' | 'twobuttons' | 'unknown'`

**플랫폼**: Android 전용(iOS에서는 "unknown" 반환)

**값**:

| 값 | 설명 |
|-------|-------------|
| `gesture` | 제스처 내비게이션(스와이프 기반) |
| `buttons` | 기존 3버튼 내비게이션(뒤로, 홈, 최근 앱) |
| `twobuttons` | 2버튼 내비게이션(뒤로, 위로 스와이프하는 홈) |
| `unknown` | 판단 불가(iOS에서는 항상 이 값) |

**활용 예**:

```typescript
const navMode = DeviceInfoModule.navigationMode;

if (navMode === 'gesture') {
  // Avoid bottom gesture conflicts
  // Add extra bottom padding for bottom sheets
  console.log('Using gesture navigation - add extra padding');
} else if (navMode === 'buttons') {
  // Traditional navigation bar is present
  console.log('Using button navigation');
}
```

**참고**: 내비게이션 방식 감지는 Android 10(API 29) 이상이 필요합니다. 이전 Android에서는 제스처 내비게이션을 지원하지 않았으므로 `"buttons"`를 반환합니다.

### `getHasGms(): boolean` {#gethasgms-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Google Mobile Services 사용 가능 여부를 확인합니다.

```typescript
const hasGms = DeviceInfoModule.getHasGms();
// Android with Play Services → true
// Huawei devices without GMS → false
// iOS → false
```

**플랫폼**: Android 전용

### `getHasHms(): boolean` {#gethashms-boolean}

<span class="rp-badge rp-badge--tip">v1.3.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

Huawei Mobile Services 사용 가능 여부를 확인합니다.

```typescript
const hasHms = DeviceInfoModule.getHasHms();
// Huawei devices → true
// Other Android/iOS → false
```

**플랫폼**: Android(Huawei 기기) 전용

### `hasSystemFeature(feature: string): boolean` {#hassystemfeaturefeature-string-boolean}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

특정 시스템 기능의 사용 가능 여부를 확인합니다.

```typescript
const hasNfc = DeviceInfoModule.hasSystemFeature('android.hardware.nfc');
// Android → true/false based on hardware
// iOS → false
```

**플랫폼**: Android 전용

**주요 기능**:

- `android.hardware.camera`
- `android.hardware.nfc`
- `android.hardware.bluetooth`
- `android.hardware.wifi`

### `systemAvailableFeatures: string[]` {#systemavailablefeatures-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

사용 가능한 모든 시스템 기능 목록을 읽습니다.

```typescript
const features = DeviceInfoModule.systemAvailableFeatures;
// Android: ["android.hardware.camera", "android.hardware.nfc", ...]
// iOS: []
```

**플랫폼**: Android 전용

### `supportedMediaTypeList: string[]` {#supportedmediatypelist-string}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

지원하는 미디어·코덱 타입 목록을 읽습니다.

```typescript
const mediaTypes = DeviceInfoModule.supportedMediaTypeList;
// Android: ["video/avc", "audio/mp4a-latm", ...]
// iOS: []
```

**플랫폼**: Android 전용

### Android 빌드 정보 {#android-build-information}

Android 시스템 빌드 정보를 읽는 동기 속성입니다.

**플랫폼**: Android 전용(iOS에서는 모두 "unknown" 또는 기본값 반환)

```typescript
const serialNumber = DeviceInfoModule.serialNumber; // Android 8–9 needs granted READ_PHONE_STATE; Android 10+ is restricted
const androidId = DeviceInfoModule.androidId;
const previewSdkInt = DeviceInfoModule.previewSdkInt; // Android API 23+, 0 for release
const securityPatch = DeviceInfoModule.securityPatch; // Android API 23+, "YYYY-MM-DD"
const codename = DeviceInfoModule.codename; // "REL" for release
const incremental = DeviceInfoModule.incremental;
const board = DeviceInfoModule.board;
const bootloader = DeviceInfoModule.bootloader;
const device = DeviceInfoModule.device; // Board/platform name
const display = DeviceInfoModule.display; // Build display ID
const fingerprint = DeviceInfoModule.fingerprint; // Unique build identifier
const hardware = DeviceInfoModule.hardware;
const host = DeviceInfoModule.host; // Build host machine
const product = DeviceInfoModule.product;
const tags = DeviceInfoModule.tags; // Comma-separated
const type = DeviceInfoModule.type; // "user", "userdebug", "eng"
const baseOs = DeviceInfoModule.baseOs; // Android API 23+
const radioVersion = DeviceInfoModule.radioVersion;
const buildId = DeviceInfoModule.buildId;
```

| 속성 | 지원 여부 |
| --- | --- |
| `serialNumber` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--warning">Android API 24+: 제한적 지원</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `androidId` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `previewSdkInt` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `securityPatch` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `codename` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `incremental` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `board` | <span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `bootloader` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `device` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `display` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `fingerprint` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `hardware` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `host` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `product` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `tags` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `type` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `baseOs` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `radioVersion` | <span class="rp-badge rp-badge--tip">v1.5.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |
| `buildId` | <span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> |

`serialNumber`는 처음 접근할 때 캐시합니다. Android 8–9에서는 `READ_PHONE_STATE` 권한을 받아야 합니다. Android 10 이상은 권한을 받아도 일반 앱의 접근을 제한합니다.

---

## iOS 플랫폼(API 2개) {#ios-platform-2-apis}

iOS 전용 API입니다.

### `getDeviceToken(): Promise<string>` {#getdevicetoken-promisestring}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: reject</span> <span class="rp-badge rp-badge--warning">웹: reject</span>

Apple DeviceCheck 토큰을 읽습니다.

```typescript
try {
  const deviceToken = await DeviceInfoModule.getDeviceToken();
  console.log('DeviceCheck token:', deviceToken);
} catch (error) {
  console.error('DeviceCheck error:', error);
}
```

**플랫폼**: iOS. DeviceCheck는 iOS 11부터 있지만 이 패키지는 iOS 15.1 이상이 필요합니다. Android에서는 reject됩니다.

### `syncUniqueId(): Promise<string>` {#syncuniqueid-promisestring}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--warning">Android: ID만 반환</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

iOS에서 현재 IDFV를 앱 전용 Keychain 항목에 기록합니다. iCloud Keychain 동기화를 켜거나 이전 IDFV를 복원하지는 않습니다.

```typescript
const uniqueId = await DeviceInfoModule.syncUniqueId();
// iOS: Writes and returns the current IDFV.
// Android: Returns uniqueId without a Keychain operation.
```

**플랫폼**: iOS(Android에서는 기록 작업 없음)

---

## 설치와 배포(API 3개) {#installation--distribution-3-apis}

앱 설치와 배포 메타데이터입니다.

### `installerPackageName: string` {#installerpackagename-string}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

앱을 설치한 앱 스토어의 패키지 이름을 읽습니다.

```typescript
const installer = DeviceInfoModule.installerPackageName;
// iOS: "com.apple.AppStore", "com.apple.TestFlight"
// Android: "com.android.vending" (Play Store)
```

### `getInstallReferrer(): Promise<string>` {#getinstallreferrer-promisestring}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

설치 리퍼러 정보를 읽습니다(Android Play Store).

```typescript
const referrer = await DeviceInfoModule.getInstallReferrer();
// Android with Play Services: referrer data
// iOS: "unknown"
```

**플랫폼**: Android 전용(Google Play Services 필요)

### `isSideLoadingEnabled(): boolean` {#issideloadingenabled-boolean}

<span class="rp-badge rp-badge--tip">v1.4.2부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

사이드로딩(알 수 없는 출처의 설치)이 켜져 있는지 확인합니다.

```typescript
const canSideload = DeviceInfoModule.isSideLoadingEnabled();

if (canSideload) {
  console.warn('Device allows sideloading - potential security risk');
}
```

**플랫폼별 동작 차이**:
- **Android 7 이하**: 기기 전체에서 알 수 없는 출처를 허용하는지 반환합니다(`Settings.Global.INSTALL_NON_MARKET_APPS` 확인).
- **Android 8.0 이상**: 이 앱에 다른 앱을 설치할 권한이 있는지 반환합니다(`canRequestPackageInstalls()`로 앱별 권한 확인).
- **iOS**: 이 API는 항상 `false`를 반환하며 사이드로딩을 감지하지 않습니다.

**중요**: Android 8.0 이상에서는 다른 앱에 "알 수 없는 앱 설치"를 허용했더라도 이 앱에 별도로 허용하지 않았다면 `false`를 반환합니다.

**활용 예**:
- 보안 정책 적용
- 배포 경로 확인
- 기업 배포 확인

**플랫폼**: Android(iOS에서는 `false` 반환)

---

## 레거시 호환(API 2개) {#legacy-compatibility-2-apis}

이전 버전과의 호환을 위한 사용 중단 예정 API입니다.

### `totalDiskCapacityOld: number` {#totaldiskcapacityold-number}

<span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

레거시 Android API로 전체 디스크 용량을 읽습니다.

```typescript
const totalDiskOld = DeviceInfoModule.totalDiskCapacityOld;
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to totalDiskCapacity
```

### `getFreeDiskStorageOld(): number` {#getfreediskstorageold-number}

<span class="rp-badge rp-badge--tip">v1.1.0부터</span> <span class="rp-badge rp-badge--info">iOS 15.1+</span> <span class="rp-badge rp-badge--info">Android API 24+</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span>

레거시 Android API로 남은 디스크 공간을 읽습니다.

```typescript
const freeDiskOld = DeviceInfoModule.getFreeDiskStorageOld();
// Android: Uses old StatFs API (pre-Jelly Bean compatibility)
// iOS: Alias to getFreeDiskStorage()
```

---

### 지원하지 않는 호환 속성 {#unsupported-compatibility-properties}

API 호환성을 위해 유지하는 속성입니다. 이 패키지에는 Windows 네이티브 타깃이 없습니다. iOS, Android, 웹에서 고정 기본값을 반환합니다.

| 속성 | 지원 여부 | 기본값 |
| --- | --- | --- |
| `isMouseConnected` | <span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> | `false` |
| `isKeyboardConnected` | <span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> | `false` |
| `hostNames` | <span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> | `[]` |
| `isTabletMode` | <span class="rp-badge rp-badge--tip">v1.2.0부터</span> <span class="rp-badge rp-badge--warning">iOS: fallback 값</span> <span class="rp-badge rp-badge--warning">Android: fallback 값</span> <span class="rp-badge rp-badge--warning">웹: fallback 값</span> | `false` |

---

## 성능 참고 사항 {#performance-notes}

동기 속성과 메서드는 호출한 스레드에서 실행합니다. 일부 API는 OS를 조회하거나 캐시를 초기화하므로 동기 호출이 즉시 완료된다는 뜻은 아닙니다.

Promise 메서드는 완료 시간을 보장하지 않습니다. iOS의 `getUserAgent()`는 처음 성공하는 호출에서 WebView를 초기화하고 결과를 캐시합니다. 렌더링 중 비용이 큰 API를 반복 호출하지 마세요.

### 캐시 {#caching}

다음 동기 메서드는 5초 캐시를 사용합니다.

- `getIpAddressSync()`
- `getMacAddressSync()`
- `getCarrierSync()`

캐시를 갱신할 때 OS를 조회합니다. 만료 후 다음 호출까지 이전 값이 남을 수 있습니다. 계속 바뀌는 배터리·오디오 상태에는 [React 훅](/api/hooks)을 사용하세요.

실제 앱의 기기, OS, 빌드 모드, 캐시 상태에서 지연 시간을 측정하세요.

---

## 플랫폼 호환성 {#platform-compatibility-matrix}

같은 범주에 있는 속성·메서드도 지원 여부가 다릅니다. 각 API나 속성 묶음 옆의 배지를 확인하세요. [배지 정의](/api/#availability-badges)와 [웹 제한](/guide/web-support)을 참고하세요.

---

## 다음 단계 {#next-steps}

- [타입 정의](/api/types)에서 TypeScript 타입 확인
- [사용 예제](/examples/basic-usage) 확인
- `react-native-device-info`에서 전환하려면 [마이그레이션 가이드](/api/migration) 확인
