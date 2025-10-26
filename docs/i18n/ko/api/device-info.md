# DeviceInfo 모듈

`DeviceInfoModule`은 기기 정보에 액세스하기 위한 기본 API를 제공합니다.

## 가져오기

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';
```

## 기기 식별

### deviceId
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기의 고유 식별자를 반환합니다.

```typescript
const id = DeviceInfoModule.deviceId; // "iPhone14,2"
```

### brand
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기 브랜드를 반환합니다.

```typescript
const brand = DeviceInfoModule.brand; // "Apple" 또는 "Samsung"
```

### model
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기 모델을 반환합니다.

```typescript
const model = DeviceInfoModule.model; // "iPhone 13 Pro"
```

### manufacturer
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기 제조사를 반환합니다.

```typescript
const manufacturer = DeviceInfoModule.manufacturer; // "Apple"
```

## 시스템 정보

### systemVersion
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

운영 체제 버전을 반환합니다.

```typescript
const version = DeviceInfoModule.systemVersion; // "15.0"
```

### apiLevel
- **타입**: `number`
- **플랫폼**: Android
- **동기**: ✓

Android API 레벨을 반환합니다.

```typescript
const api = DeviceInfoModule.apiLevel; // 31
```

### buildNumber
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

빌드 번호를 반환합니다.

```typescript
const build = DeviceInfoModule.buildNumber; // "19A346"
```

## 하드웨어 정보

### getTotalMemory()
- **반환**: `number`
- **플랫폼**: iOS, Android
- **동기**: ✓

총 메모리를 바이트 단위로 반환합니다.

```typescript
const total = DeviceInfoModule.getTotalMemory(); // 8589934592
```

### getUsedMemory()
- **반환**: `number`
- **플랫폼**: iOS, Android
- **동기**: ✓

사용 중인 메모리를 바이트 단위로 반환합니다.

```typescript
const used = DeviceInfoModule.getUsedMemory(); // 4294967296
```

### isTablet()
- **반환**: `boolean`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기가 태블릿인지 확인합니다.

```typescript
const isTablet = DeviceInfoModule.isTablet(); // false
```

## 배터리 정보

### getBatteryLevel()
- **반환**: `number`
- **플랫폼**: iOS, Android
- **동기**: ✓

배터리 레벨을 0-1 범위로 반환합니다.

```typescript
const level = DeviceInfoModule.getBatteryLevel(); // 0.85
```

### getPowerState()
- **반환**: `PowerState`
- **플랫폼**: iOS, Android
- **동기**: ✓

전원 상태 정보를 반환합니다.

```typescript
const state = DeviceInfoModule.getPowerState();
// { batteryLevel: 0.85, batteryState: 'charging', lowPowerMode: false }
```

## 네트워크 정보 (비동기)

### getIpAddress()
- **반환**: `Promise<string>`
- **플랫폼**: iOS, Android
- **동기**: ✗

기기의 IP 주소를 반환합니다.

```typescript
const ip = await DeviceInfoModule.getIpAddress(); // "192.168.1.100"
```

### getCarrier()
- **반환**: `Promise<string>`
- **플랫폼**: iOS, Android
- **동기**: ✗

통신사 이름을 반환합니다.

```typescript
const carrier = await DeviceInfoModule.getCarrier(); // "Verizon"
```

## 애플리케이션 정보

### appVersion
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

앱 버전을 반환합니다.

```typescript
const version = DeviceInfoModule.appVersion; // "1.0.0"
```

### bundleId
- **타입**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

앱 번들 ID를 반환합니다.

```typescript
const bundleId = DeviceInfoModule.bundleId; // "com.example.app"
```

## 고급 메서드

### getUniqueId()
- **반환**: `string`
- **플랫폼**: iOS, Android
- **동기**: ✓

기기의 고유 식별자를 반환합니다.

```typescript
const uniqueId = DeviceInfoModule.getUniqueId();
```

## 전체 API

전체 메서드 및 속성 목록은 [타입 정의](/api/types)를 참조하세요.
