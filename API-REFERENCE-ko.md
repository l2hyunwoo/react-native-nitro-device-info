# API 레퍼런스

react-native-nitro-device-info의 완전한 API 문서입니다.

## 목차

- [핵심 디바이스 정보](#핵심-디바이스-정보)
- [디바이스 기능](#디바이스-기능)
- [디바이스 식별](#디바이스-식별)
- [시스템 리소스](#시스템-리소스)
- [배터리 정보](#배터리-정보)
- [애플리케이션 메타데이터](#애플리케이션-메타데이터)
- [네트워크 및 연결](#네트워크-및-연결)
- [플랫폼별 메서드](#플랫폼별-메서드)
- [Android 빌드 정보](#android-빌드-정보)
- [설치 메타데이터](#설치-메타데이터)
- [고급 기능](#고급-기능)
- [iOS 전용 기능](#ios-전용-기능)
- [타입 정의](#타입-정의)

---

## 핵심 디바이스 정보

기본 디바이스 정보에 즉시 액세스할 수 있는 동기 속성입니다.

### 속성

#### `deviceId: string`

디바이스 모델 식별자.

```typescript
const deviceId = DeviceInfoModule.deviceId;
// iOS: "iPhone14,2"
// Android: "SM-G998B"
```

#### `brand: string`

디바이스 브랜드/제조사 이름.

```typescript
const brand = DeviceInfoModule.brand;
// iOS: "Apple"
// Android: "Samsung", "Google", "OnePlus" 등
```

#### `systemName: string`

운영체제 이름.

```typescript
const systemName = DeviceInfoModule.systemName;
// iOS: "iOS" 또는 "iPadOS"
// Android: "Android"
```

#### `systemVersion: string`

운영체제 버전 문자열.

```typescript
const systemVersion = DeviceInfoModule.systemVersion;
// iOS: "15.0", "16.2.1"
// Android: "12", "13", "14"
```

#### `model: string`

디바이스 모델 이름.

```typescript
const model = DeviceInfoModule.model;
// iOS: "iPhone", "iPad"
// Android: 기기별 모델명
```

#### `deviceType: DeviceType`

디바이스 타입 카테고리.

```typescript
const deviceType = DeviceInfoModule.deviceType;
// "Handset" | "Tablet" | "Tv" | "Desktop" | "GamingConsole" | "unknown"
```

---

## 디바이스 기능

### `isTablet(): boolean`

태블릿 기기인지 확인합니다.

```typescript
const isTablet = DeviceInfoModule.isTablet();
// iPad → true
// iPhone → false
```

- **iOS**: UIDevice.userInterfaceIdiom 기반
- **Android**: 최소 화면 너비 >= 600dp 기준

### `hasNotch(): boolean`

디스플레이 노치가 있는지 확인합니다.

```typescript
const hasNotch = DeviceInfoModule.hasNotch();
// iPhone X, 11, 12, 13 → true
// iPhone SE, 8 → false
```

- **iOS 전용** - iPhone X 이상 모델 감지
- **Android**: 항상 `false` 반환 (제조사별로 감지가 복잡함)

### `hasDynamicIsland(): boolean`

Dynamic Island가 있는지 확인합니다.

```typescript
const hasDynamicIsland = DeviceInfoModule.hasDynamicIsland();
// iPhone 14 Pro, 15 Pro → true
// iPhone 14, 13 → false
```

- **iOS 16+ 전용** - iPhone 14 Pro 이상
- **Android**: 항상 `false` 반환

### `isCameraPresent(): boolean`

카메라 사용 가능 여부를 확인합니다.

```typescript
const hasCamera = DeviceInfoModule.isCameraPresent();
```

### `isPinOrFingerprintSet(): boolean`

PIN, 지문 또는 Face ID가 설정되어 있는지 확인합니다.

```typescript
const isSecure = DeviceInfoModule.isPinOrFingerprintSet();
```

### `isEmulator(): boolean`

시뮬레이터/에뮬레이터에서 실행 중인지 확인합니다.

```typescript
const isEmulator = DeviceInfoModule.isEmulator();
```

---

## 디바이스 식별

### `getUniqueId(): string`

고유 디바이스 식별자를 가져옵니다.

```typescript
const uniqueId = DeviceInfoModule.getUniqueId();
// iOS: IDFV (Identifier for Vendor)
// Android: ANDROID_ID
// 예시: "FCDBD8EF-62FC-4ECB-B2F5-92C9E79AC7F9"
```

- **iOS**: 동일 vendor의 앱 재설치 시에도 유지
- **Android**: 일반적으로 앱 재설치 시에도 유지

### `getManufacturer(): string`

디바이스 제조사 이름을 가져옵니다.

```typescript
const manufacturer = DeviceInfoModule.getManufacturer();
// iOS: "Apple"
// Android: "Samsung", "Google", "Xiaomi" 등
```

---

## 시스템 리소스

### `getTotalMemory(): number`

총 디바이스 RAM 용량(바이트)을 가져옵니다.

```typescript
const totalMemory = DeviceInfoModule.getTotalMemory();
// 예시: 6442450944 (6 GB)
console.log(`총 RAM: ${(totalMemory / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

### `getUsedMemory(): number`

현재 앱 메모리 사용량(바이트)을 가져옵니다.

```typescript
const usedMemory = DeviceInfoModule.getUsedMemory();
// 예시: 134217728 (128 MB)
console.log(`사용 중인 메모리: ${(usedMemory / 1024 / 1024).toFixed(0)}MB`);
```

### `getTotalDiskCapacity(): number`

총 내부 저장공간 크기(바이트)를 가져옵니다.

```typescript
const totalDisk = DeviceInfoModule.getTotalDiskCapacity();
// 예시: 128849018880 (120 GB)
console.log(`총 저장공간: ${(totalDisk / 1024 / 1024 / 1024).toFixed(0)}GB`);
```

### `getFreeDiskStorage(): number`

사용 가능한 여유 저장공간(바이트)을 가져옵니다.

```typescript
const freeDisk = DeviceInfoModule.getFreeDiskStorage();
// 예시: 51539607552 (48 GB)
console.log(`여유 저장공간: ${(freeDisk / 1024 / 1024 / 1024).toFixed(1)}GB`);
```

---

## 배터리 정보

### `getBatteryLevel(): number`

현재 배터리 잔량(0.0 ~ 1.0)을 가져옵니다.

```typescript
const batteryLevel = DeviceInfoModule.getBatteryLevel();
console.log(`배터리: ${(batteryLevel * 100).toFixed(0)}%`);
// 출력: "배터리: 75%"
```

### `getPowerState(): PowerState`

포괄적인 전원 상태 정보를 가져옵니다.

```typescript
const powerState = DeviceInfoModule.getPowerState();
console.log(`배터리: ${(powerState.batteryLevel * 100).toFixed(0)}%`);
console.log(`상태: ${powerState.batteryState}`);
console.log(`저전력 모드: ${powerState.lowPowerMode}`); // iOS 전용
```

**PowerState** 인터페이스:

```typescript
interface PowerState {
  batteryLevel: number; // 0.0 ~ 1.0
  batteryState: BatteryState; // 'unknown' | 'unplugged' | 'charging' | 'full'
  lowPowerMode: boolean; // iOS 전용
}
```

### `isBatteryCharging(): boolean`

배터리가 현재 충전 중인지 확인합니다.

```typescript
const isCharging = DeviceInfoModule.isBatteryCharging();
```

### `isLowBatteryLevel(threshold: number): boolean`

배터리 잔량이 임계값 이하인지 확인합니다.

```typescript
const isLowBattery = DeviceInfoModule.isLowBatteryLevel(0.2); // 20%
if (isLowBattery) {
  console.log('배터리가 부족합니다. 충전해주세요');
}
```

---

## 애플리케이션 메타데이터

### 동기

#### `getVersion(): string`

애플리케이션 버전 문자열을 가져옵니다.

```typescript
const version = DeviceInfoModule.getVersion();
// 예시: "1.2.3"
```

#### `getBuildNumber(): string`

애플리케이션 빌드 번호를 가져옵니다.

```typescript
const buildNumber = DeviceInfoModule.getBuildNumber();
// 예시: "42" 또는 "20231025"
```

#### `getBundleId(): string`

번들 ID(iOS) 또는 패키지명(Android)을 가져옵니다.

```typescript
const bundleId = DeviceInfoModule.getBundleId();
// 예시: "com.company.app"
```

#### `getApplicationName(): string`

애플리케이션 표시 이름을 가져옵니다.

```typescript
const appName = DeviceInfoModule.getApplicationName();
// 예시: "나의 멋진 앱"
```

#### `readableVersion: string`

사람이 읽기 쉬운 버전 문자열(version.buildNumber)을 가져옵니다.

```typescript
const readableVersion = DeviceInfoModule.readableVersion;
// 예시: "1.2.3.42"
```

### 비동기

#### `getFirstInstallTime(): Promise<number>`

앱이 처음 설치된 시각(epoch 기준 ms)을 가져옵니다.

```typescript
const installTime = await DeviceInfoModule.getFirstInstallTime();
const installDate = new Date(installTime);
console.log(`설치 시각: ${installDate.toLocaleDateString()}`);
```

**성능**: ~10-30ms

#### `getLastUpdateTime(): Promise<number>`

가장 최근 앱 업데이트 시각(epoch 기준 ms)을 가져옵니다.

```typescript
const updateTime = await DeviceInfoModule.getLastUpdateTime();
const updateDate = new Date(updateTime);
console.log(`마지막 업데이트: ${updateDate.toLocaleDateString()}`);
```

**성능**: ~10-30ms
**참고**: iOS에서는 -1 반환

#### 동기 변형

비동기가 필요 없을 때 더 나은 성능을 위해:

```typescript
const firstInstallTimeSync = DeviceInfoModule.firstInstallTimeSync;
const lastUpdateTimeSync = DeviceInfoModule.lastUpdateTimeSync; // iOS에서 -1
```

---

## 네트워크 및 연결

시스템 I/O 요구사항으로 인해 모든 네트워크 메서드는 비동기입니다.

### `getIpAddress(): Promise<string>`

디바이스 로컬 IP 주소를 가져옵니다.

```typescript
const ipAddress = await DeviceInfoModule.getIpAddress();
// 예시: "192.168.1.100", "10.0.0.5"
```

**성능**: ~20-50ms

**동기 변형** (5초 캐시):

```typescript
const ipAddressSync = DeviceInfoModule.ipAddressSync;
```

### `getMacAddress(): Promise<string>`

디바이스 MAC 주소를 가져옵니다.

```typescript
const macAddress = await DeviceInfoModule.getMacAddress();
// iOS: "02:00:00:00:00:00" (iOS 7부터 프라이버시 보호를 위해 하드코딩됨)
// Android: "00:11:22:33:44:55" (실제 MAC)
```

**성능**: ~20-50ms

**동기 변형**:

```typescript
const macAddressSync = DeviceInfoModule.macAddressSync;
```

### `getCarrier(): Promise<string>`

이동통신사 이름을 가져옵니다.

```typescript
const carrier = await DeviceInfoModule.getCarrier();
// 예시: "SK Telecom", "KT", "LG U+"
```

**성능**: ~20-50ms

**동기 변형** (5초 캐시):

```typescript
const carrierSync = DeviceInfoModule.carrierSync;
```

### `isLocationEnabled(): Promise<boolean>`

위치 서비스가 활성화되어 있는지 확인합니다.

```typescript
const isLocationEnabled = await DeviceInfoModule.isLocationEnabled();
```

**성능**: ~10-30ms

**동기 변형**:

```typescript
const isLocationEnabledSync = DeviceInfoModule.isLocationEnabledSync;
```

### `isHeadphonesConnected(): Promise<boolean>`

헤드폰(유선 또는 블루투스)이 연결되어 있는지 확인합니다.

```typescript
const hasHeadphones = await DeviceInfoModule.isHeadphonesConnected();
```

**성능**: ~10-30ms

**동기 변형**:

```typescript
const isHeadphonesConnectedSync = DeviceInfoModule.isHeadphonesConnectedSync;
```

### `getUserAgent(): Promise<string>`

HTTP User-Agent 문자열을 가져옵니다.

```typescript
const userAgent = await DeviceInfoModule.getUserAgent();
// 예시: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) ..."
```

**성능**:
- iOS: 100-500ms (WebView 초기화 필요, 첫 호출 후 캐시됨)
- Android: 동기 가능

### `getDeviceName(): string`

사용자가 지정한 디바이스 이름을 가져옵니다.

```typescript
const deviceName = DeviceInfoModule.getDeviceName();
// 예시: "철수의 iPhone", "나의 Galaxy S21"
```

---

## 플랫폼별 메서드

### `getApiLevel(): number`

Android API 레벨을 가져옵니다.

```typescript
const apiLevel = DeviceInfoModule.getApiLevel();
// Android 12 → 31
// Android 13 → 33
// iOS → -1
```

**플랫폼**: Android 전용

### `getSupportedAbis(): string[]`

지원되는 CPU 아키텍처를 가져옵니다.

```typescript
const abis = DeviceInfoModule.getSupportedAbis();
// iOS: ["arm64"]
// Android: ["arm64-v8a", "armeabi-v7a"]
```

### `getSupported32BitAbis(): string[]`

지원되는 32비트 ABI 목록을 가져옵니다.

```typescript
const abis32 = DeviceInfoModule.getSupported32BitAbis();
// iOS: []
// Android API 21+: ["armeabi-v7a", "x86"]
```

**플랫폼**: Android API 21+, iOS에서는 `[]` 반환

### `getSupported64BitAbis(): string[]`

지원되는 64비트 ABI 목록을 가져옵니다.

```typescript
const abis64 = DeviceInfoModule.getSupported64BitAbis();
// iOS: ["arm64"]
// Android API 21+: ["arm64-v8a", "x86_64"]
```

### `hasGms(): boolean`

Google Mobile Services를 사용할 수 있는지 확인합니다.

```typescript
const hasGms = DeviceInfoModule.hasGms();
// Play Services가 있는 Android → true
// GMS가 없는 Huawei 기기 → false
// iOS → false
```

**플랫폼**: Android 전용

### `hasHms(): boolean`

Huawei Mobile Services를 사용할 수 있는지 확인합니다.

```typescript
const hasHms = DeviceInfoModule.hasHms();
// Huawei 기기 → true
// 기타 Android/iOS → false
```

**플랫폼**: Android(Huawei 기기) 전용

### `getFontScale(): number`

현재 글꼴 크기 배율을 가져옵니다.

```typescript
const fontScale = DeviceInfoModule.getFontScale();
// 예시: 1.0 (보통), 1.2 (크게), 0.85 (작게)
```

**플랫폼**: iOS, Android

### `hasSystemFeature(feature: string): boolean`

특정 시스템 기능을 사용할 수 있는지 확인합니다.

```typescript
const hasNfc = DeviceInfoModule.hasSystemFeature('android.hardware.nfc');
// Android → 하드웨어 기반으로 true/false
// iOS → false
```

**플랫폼**: Android 전용

**일반적인 기능**:
- `android.hardware.camera`
- `android.hardware.nfc`
- `android.hardware.bluetooth`
- `android.hardware.wifi`

### `getSystemAvailableFeatures(): string[]`

사용 가능한 모든 시스템 기능 목록을 가져옵니다.

```typescript
const features = DeviceInfoModule.getSystemAvailableFeatures();
// Android: ["android.hardware.camera", "android.hardware.nfc", ...]
// iOS: []
```

**플랫폼**: Android 전용

### `getAvailableLocationProviders(): Record<string, boolean>`

사용 가능한 위치 제공자와 상태를 가져옵니다.

```typescript
const providers = DeviceInfoModule.getAvailableLocationProviders();
// { "gps": true, "network": true }
```

### `getMaxMemory(): number`

앱에서 사용 가능한 최대 메모리(바이트)를 가져옵니다.

```typescript
const maxMemory = DeviceInfoModule.getMaxMemory();
// Android: 최대 힙 크기
// iOS: -1
```

**플랫폼**: Android 전용

### `getSupportedMediaTypeList(): string[]`

지원되는 미디어/코덱 타입 목록을 가져옵니다.

```typescript
const mediaTypes = DeviceInfoModule.getSupportedMediaTypeList();
// Android: ["video/avc", "audio/mp4a-latm", ...]
// iOS: []
```

**플랫폼**: Android 전용

---

## Android 빌드 정보

Android 시스템 빌드 정보를 제공하는 동기 속성입니다.

**플랫폼**: Android 전용 (iOS에서는 "unknown" 또는 기본값 반환)

### 속성

```typescript
const serialNumber = DeviceInfoModule.serialNumber; // Android 8.0+에서 READ_PHONE_STATE 권한 필요
const androidId = DeviceInfoModule.androidId;
const securityPatch = DeviceInfoModule.securityPatch; // Android API 23+, "YYYY-MM-DD"
const bootloader = DeviceInfoModule.bootloader;
const codename = DeviceInfoModule.codename; // 릴리스의 경우 "REL"
const device = DeviceInfoModule.device; // 보드/플랫폼 이름
const display = DeviceInfoModule.display; // 빌드 display ID
const fingerprint = DeviceInfoModule.fingerprint; // 고유 빌드 식별자
const hardware = DeviceInfoModule.hardware;
const host = DeviceInfoModule.host; // 빌드 호스트 머신
const product = DeviceInfoModule.product;
const tags = DeviceInfoModule.tags; // 쉼표로 구분
const type = DeviceInfoModule.type; // "user", "userdebug", "eng"
const baseOs = DeviceInfoModule.baseOs; // Android API 23+
const previewSdkInt = DeviceInfoModule.previewSdkInt; // Android API 23+, 릴리스는 0
const incremental = DeviceInfoModule.incremental;
const buildId = DeviceInfoModule.buildId;
```

---

## 설치 메타데이터

### 속성

#### `installerPackageName: string`

이 앱을 설치한 앱 스토어의 패키지 이름을 가져옵니다.

```typescript
const installer = DeviceInfoModule.installerPackageName;
// iOS: "com.apple.AppStore", "com.apple.TestFlight"
// Android: "com.android.vending" (Play 스토어)
```

#### `startupTime: number`

디바이스 부팅 시각(epoch 기준 ms)을 가져옵니다.

```typescript
const bootTime = DeviceInfoModule.startupTime;
const bootDate = new Date(bootTime);
console.log(`디바이스 부팅 시각: ${bootDate.toLocaleString()}`);
```

**참고**: 앱 시작 시각이 아닌 부팅 시각을 반환합니다

### 메서드

#### `getInstallReferrer(): Promise<string>`

설치 리퍼러 정보(Android Play 스토어)를 가져옵니다.

```typescript
const referrer = await DeviceInfoModule.getInstallReferrer();
// Play Services가 있는 Android: 리퍼러 데이터
// iOS: "unknown"
```

**성능**: ~50-200ms (Play Services API 호출)
**플랫폼**: Android 전용 (Google Play Services 필요)

---

## 고급 기능

### 헤드폰 감지

#### `isWiredHeadphonesConnected(): boolean`

유선 헤드폰이 연결되어 있는지 확인합니다.

```typescript
const hasWiredHeadphones = DeviceInfoModule.isWiredHeadphonesConnected();
```

**플랫폼**: iOS, Android

#### `isBluetoothHeadphonesConnected(): boolean`

블루투스 헤드폰이 연결되어 있는지 확인합니다.

```typescript
const hasBluetoothHeadphones = DeviceInfoModule.isBluetoothHeadphonesConnected();
```

**플랫폼**: iOS, Android

### 디바이스 상태

#### `isAirplaneMode(): boolean`

비행기 모드가 활성화되어 있는지 확인합니다.

```typescript
const isAirplaneMode = DeviceInfoModule.isAirplaneMode();
// Android: true/false
// iOS: false (사용 불가)
```

**플랫폼**: Android 전용

#### `isLowRamDevice(): boolean`

디바이스가 저용량 RAM 기기로 분류되는지 확인합니다.

```typescript
const isLowRam = DeviceInfoModule.isLowRamDevice();
// Android API 19+: true/false
// iOS: false
```

**플랫폼**: Android API 19+

#### `isLandscape(): boolean`

디바이스가 가로 방향인지 확인합니다.

```typescript
const isLandscape = DeviceInfoModule.isLandscape();
```

### Windows 전용 (iOS/Android에서 미구현)

모바일 플랫폼에서는 항상 `false`를 반환합니다:

- `isMouseConnected(): boolean`
- `isKeyboardConnected(): boolean`
- `isTabletMode(): boolean`
- `getHostNames(): string[]` - `[]` 반환

---

## iOS 전용 기능

### `isDisplayZoomed(): boolean`

iOS Display Zoom이 활성화되어 있는지 확인합니다.

```typescript
const isZoomed = DeviceInfoModule.isDisplayZoomed();
// iOS: 디스플레이 확대 설정에 따라 true/false
// Android: false
```

**플랫폼**: iOS 전용

### `getBrightness(): number`

현재 화면 밝기 레벨(0.0 ~ 1.0)을 가져옵니다.

```typescript
const brightness = DeviceInfoModule.getBrightness();
console.log(`밝기: ${(brightness * 100).toFixed(0)}%`);
// iOS: 0.0 ~ 1.0
// Android: -1
```

**플랫폼**: iOS 전용

### `getDeviceToken(): Promise<string>`

Apple DeviceCheck 토큰을 가져옵니다.

```typescript
try {
  const deviceToken = await DeviceInfoModule.getDeviceToken();
  console.log('DeviceCheck 토큰:', deviceToken);
} catch (error) {
  console.error('DeviceCheck 오류:', error);
}
```

**성능**: ~500-2000ms (Apple 서버로 네트워크 요청)
**플랫폼**: iOS 11+ 전용 (Android에서는 오류 발생)

### `syncUniqueId(): Promise<string>`

고유 ID를 iCloud Keychain에 동기화합니다.

```typescript
const uniqueId = await DeviceInfoModule.syncUniqueId();
// iOS: IDFV를 Keychain에 저장 (재설치 시에도 유지)
// Android: Keychain 동기화 없이 getUniqueId() 반환
```

**성능**: ~10-50ms (Keychain I/O)
**플랫폼**: iOS (Android에서는 no-op)

---

## 레거시 호환성

### `getTotalDiskCapacityOld(): number`

레거시 Android API를 사용하여 총 디스크 용량을 가져옵니다.

```typescript
const totalDiskOld = DeviceInfoModule.getTotalDiskCapacityOld();
// Android: 구형 StatFs API 사용 (Jelly Bean 이전 호환성)
// iOS: getTotalDiskCapacity()의 별칭
```

### `getFreeDiskStorageOld(): number`

레거시 Android API를 사용하여 여유 디스크 공간을 가져옵니다.

```typescript
const freeDiskOld = DeviceInfoModule.getFreeDiskStorageOld();
// Android: 구형 StatFs API 사용 (Jelly Bean 이전 호환성)
// iOS: getFreeDiskStorage()의 별칭
```

---

## 타입 정의

### PowerState

```typescript
interface PowerState {
  /**
   * 배터리 충전 레벨 (0.0 ~ 1.0)
   * @example 0.75는 75% 배터리를 나타냄
   */
  batteryLevel: number;

  /**
   * 현재 배터리 충전 상태
   */
  batteryState: BatteryState;

  /**
   * 저전력 모드 활성화 여부
   * @platform iOS 전용
   */
  lowPowerMode: boolean;
}
```

### BatteryState

```typescript
type BatteryState = 'unknown' | 'unplugged' | 'charging' | 'full';
```

### DeviceType

```typescript
type DeviceType =
  | 'Handset'    // 스마트폰
  | 'Tablet'     // 태블릿
  | 'Tv'         // TV 또는 셋톱박스
  | 'Desktop'    // 데스크톱 컴퓨터
  | 'GamingConsole'
  | 'unknown';
```

---

## 성능 참고사항

### 동기 메서드 (<1ms)

모든 동기 메서드는 캐시된 값을 사용하며 즉시 반환합니다:

- 핵심 디바이스 속성
- 디바이스 식별
- 시스템 리소스 (메모리, 디스크)
- 배터리 정보
- 애플리케이션 메타데이터

### 비동기 메서드

작업 유형에 따라 성능이 다릅니다:

- **빠름 (10-30ms)**: 설치 시각, 위치 상태, 헤드폰 감지
- **보통 (20-50ms)**: 네트워크 쿼리 (IP, MAC, 통신사)
- **느림 (100-500ms)**: UserAgent (iOS WebView 초기화, 첫 호출 후 캐시됨)
- **매우 느림 (500-2000ms)**: DeviceCheck 토큰 (네트워크 요청)

### 캐싱

네트워크 관련 동기 속성은 5초 캐시를 사용합니다:

- `ipAddressSync`
- `macAddressSync`
- `carrierSync`

빠른 액세스를 제공하면서 데이터를 합리적으로 최신 상태로 유지합니다.

---

## 플랫폼 호환성 매트릭스

| 기능 | iOS | Android | 참고 |
|------|-----|---------|------|
| 핵심 디바이스 정보 | ✅ | ✅ | 모든 플랫폼 |
| 배터리 정보 | ✅ | ✅ | 저전력 모드는 iOS 전용 |
| 시스템 리소스 | ✅ | ✅ | 모든 플랫폼 |
| 네트워크 정보 | ✅ | ✅ | iOS 7+에서 MAC 하드코딩됨 |
| Android 빌드 정보 | ❌ | ✅ | Android 전용 |
| hasNotch/Dynamic Island | ✅ | ❌ | iOS 전용 |
| GMS/HMS 감지 | ❌ | ✅ | Android 전용 |
| DeviceCheck | ✅ | ❌ | iOS 11+ 전용 |
| Display Zoom | ✅ | ❌ | iOS 전용 |
| 밝기 | ✅ | ❌ | iOS 전용 |
| 시스템 기능 | ❌ | ✅ | Android 전용 |
| 미디어 코덱 | ❌ | ✅ | Android 전용 |

---

사용 예시와 마이그레이션 가이드는 [README-ko.md](README-ko.md)를 참고하세요.
