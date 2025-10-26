# 소개

`react-native-nitro-device-info`에 오신 것을 환영합니다 - JSI를 통한 제로 오버헤드 네이티브 액세스를 위해 [Nitro 모듈](https://nitro.margelo.com/)로 구축된 React Native용 고성능 기기 정보 라이브러리입니다.

## `react-native-nitro-device-info`란 무엇인가요?

`react-native-nitro-device-info`는 React Native 애플리케이션을 위한 포괄적인 기기 정보 및 시스템 메트릭을 제공합니다. React Native 브리지를 사용하는 기존 라이브러리와 달리, 이 라이브러리는 Nitro 모듈을 활용하여 네이티브 코드와 직접 통신하며, 기기 정보에 대한 즉각적인 동기 액세스를 제공합니다.

## 주요 기능

### 📱 100개 이상의 기기 속성

포괄적인 기기 정보에 액세스:
- 기기 식별 (모델, 브랜드, 제조사)
- 시스템 정보 (OS 버전, API 레벨)
- 하드웨어 성능 (메모리, 스토리지, 배터리)
- 네트워크 및 연결 세부정보
- 애플리케이션 메타데이터

### ⚡ 즉각적인 동기 액세스

대부분의 메서드는 비동기 오버헤드 없이 즉시(<1ms) 결과를 반환합니다. 네트워크 쿼리와 같은 I/O 바운드 작업만 비동기로 유지됩니다.

### 📦 TypeScript 우선

기본적으로 포함된 완전한 타입 정의. 모든 API는 포괄적인 IntelliSense 지원과 함께 완전히 타입이 지정되어 있습니다.

### 🌐 크로스 플랫폼 지원

다음에서 원활하게 작동합니다:
- **iOS**: 13.4+
- **Android**: API 24+ (Android 7.0 Nougat)

### 🔄 쉬운 마이그레이션

기존 프로젝트에서 원활한 전환을 위해 `react-native-device-info`와 100% API 호환됩니다.

## 왜 이 라이브러리를 선택해야 하나요?

`react-native-nitro-device-info`는 다음이 필요할 때 이상적인 선택입니다:

- **최고 수준의 성능**: <1ms 지연 시간의 동기 API
- **현대적인 아키텍처**: React Native의 새로운 아키텍처 기반
- **타입 안정성**: IntelliSense를 갖춘 완전한 TypeScript 정의
- **번거로움 없는 마이그레이션**: `react-native-device-info`에서 전환할 때 익숙한 API
- **미래 지향적**: 최신 Nitro 모듈 기술로 구축

## 빠른 예제

```typescript
import { DeviceInfoModule } from 'react-native-nitro-device-info';

// 동기 속성 (즉시 - <1ms)
console.log(DeviceInfoModule.deviceId);      // "iPhone14,2"
console.log(DeviceInfoModule.systemVersion); // "15.0"
console.log(DeviceInfoModule.brand);         // "Apple"

// 동기 메서드 (즉시 - <1ms)
const uniqueId = DeviceInfoModule.getUniqueId();
const isTablet = DeviceInfoModule.isTablet();
const batteryLevel = DeviceInfoModule.getBatteryLevel();

// 비동기 메서드 (Promise 기반 - <100ms)
const ipAddress = await DeviceInfoModule.getIpAddress();
const carrier = await DeviceInfoModule.getCarrier();
```

## 다음 단계

- 이 라이브러리에 [Nitro 모듈을 선택한 이유](/guide/why-nitro-module) 알아보기
- [시작하기](/guide/getting-started) 가이드를 따라 설치하기
- [빠른 시작](/guide/quick-start) 예제 확인하기
- 완전한 [API 레퍼런스](/api/) 탐색하기
