# 왜 Nitro 모듈인가?

`react-native-nitro-device-info`는 [Nitro 모듈](https://nitro.margelo.com/)로 구축되어 React Native 라이브러리의 중요한 아키텍처 발전을 나타냅니다. 이 페이지에서는 기술적 이점과 기존 접근 방식 대신 Nitro 모듈을 선택한 이유를 설명합니다.

## React Native 아키텍처의 진화

### 전통적인 브리지 기반 접근 방식

역사적으로 React Native 라이브러리는 **React Native 브리지**를 통해 JavaScript와 네이티브 코드 간에 통신했습니다:

1. JavaScript가 네이티브 메서드를 호출
2. 데이터가 JSON으로 직렬화
3. 메시지가 비동기적으로 브리지를 통과
4. 네이티브 코드가 JSON을 역직렬화하고 실행
5. 결과가 다시 JSON으로 직렬화
6. 응답이 다시 브리지를 통과
7. JavaScript가 결과를 수신하고 역직렬화

**문제점**:
- 높은 직렬화/역직렬화 오버헤드
- 기본적으로 비동기 (단순한 getter도)
- 빈번한 호출에 대한 성능 병목
- 큰 데이터 구조는 전송 비용이 높음

### 현대적인 JSI 기반 접근 방식

Nitro 모듈은 직접 통신을 위해 **JSI (JavaScript Interface)**를 사용합니다:

1. JavaScript가 네이티브 메서드를 호출
2. JSI가 네이티브 코드를 직접 호출 (C++ 브리지)
3. 네이티브 코드가 즉시 실행
4. 결과가 JSI를 통해 직접 반환
5. JavaScript가 결과를 동기적으로 수신

**이점**:
- 거의 제로 오버헤드 (직접 C++ 호출)
- 적절한 경우 동기 API
- JSON 직렬화 비용 없음
- 최소 지연 시간 (대부분의 호출에서 <1ms)

## 아키텍처 비교

### 이벤트 기반 (구 아키텍처)

`@react-native-community/geolocation`과 같은 라이브러리는 이벤트 기반 시스템을 사용합니다:

- 콜백이 JavaScript에만 저장됨
- 네이티브 코드가 브리지를 통해 업데이트를 전송
- EventEmitter를 통해 이벤트 전달
- 모든 리스너가 단일 이벤트 스트림을 공유
- 모든 업데이트에 JSON 직렬화

**사용 시점**: 이전 React Native 버전(< 0.68) 지원 또는 안정성 우선 시.

### 직접 콜백 (Nitro 모듈)

React Native Nitro Device Info는 직접 JSI 함수 참조를 사용합니다:

- 콜백이 네이티브 코드에 직접 전달
- 각 작업이 자체 콜백을 유지
- 최소 직렬화 (C++ 구조체 → JS 객체)
- 네이티브 코드가 브리지 없이 콜백 호출
- JSI를 통한 직접 함수 호출

**사용 시점**: 성능이 중요한 앱 구축, 새로운 아키텍처 사용, 컴파일 시간 타입 안전성 필요 시.

## JSI 기술 기반

### Nitro 모듈 작동 방식

1. **Nitrogen 코드 생성**
   - TypeScript에서 인터페이스 정의
   - Nitrogen이 C++ JSI 바인딩 생성
   - Kotlin/Swift 구현을 JSI와 연결

2. **HybridObject 시스템**
   - 네이티브 코드가 JS 함수에 대한 직접 참조 보유
   - 즉시 콜백 호출
   - 타입 안전 통신 레이어

3. **컴파일 시간 타입 안전성**
   - 완전한 TypeScript 정의
   - 생성된 네이티브 타입 매핑
   - 빌드 시점에 오류 감지

### 성능 특성

| 작업 | 브리지 기반 | Nitro 모듈 |
|------|------------|-----------|
| 단순 getter | ~5-10ms (비동기) | <1ms (동기) |
| 메서드 호출 | ~5-15ms | <1ms |
| 데이터 전송 | 크기에 선형 비례 | 최소 오버헤드 |
| 콜백 오버헤드 | 높음 (직렬화) | 거의 제로 (직접) |

## Nitro 모듈을 선택한 이유

### 1. 제로 오버헤드 네이티브 액세스

기기 정보 쿼리는 동기적이고 직접적인 액세스로부터 엄청난 이점을 얻는 빈번한 작업입니다:

```typescript
// 이전 방식 (react-native-device-info)
const brand = await DeviceInfo.getBrand(); // ~5-10ms, async 필요
const model = await DeviceInfo.getModel(); // 추가 5-10ms

// Nitro 방식
const brand = DeviceInfoModule.brand;      // <1ms, 직접 속성
const model = DeviceInfoModule.model;      // <1ms, 직접 속성
```

### 2. 적절한 동기 API

대부분의 기기 정보는 시스템 API에서 즉시 사용 가능합니다:

```typescript
// I/O 바운드 작업을 제외한 모든 것이 동기
const deviceId = DeviceInfoModule.deviceId;           // Sync
const totalMemory = DeviceInfoModule.getTotalMemory(); // Sync
const isTablet = DeviceInfoModule.isTablet();         // Sync

// 네트워크/비동기 작업만 async로 유지
const ipAddress = await DeviceInfoModule.getIpAddress(); // Async (I/O)
```

### 3. 타입 안전성 및 개발자 경험

Nitrogen은 소스 사양에서 완전한 타입 정의를 생성합니다:

```typescript
import type { DeviceInfo, PowerState, BatteryState } from 'react-native-nitro-device-info';

// 완전한 IntelliSense 지원
const powerState: PowerState = DeviceInfoModule.getPowerState();
// TypeScript는 모든 속성을 알고 있습니다: lowPowerMode, batteryLevel, batteryState
```

### 4. 미래 지향적 아키텍처

Nitro 모듈은 React Native의 **새로운 아키텍처**와 일치합니다:

- Fabric 렌더러용으로 구축
- TurboModules 호환성을 위해 설계
- Concurrent React 기능 지원
- Meta 및 커뮤니티의 장기 지원

### 5. 100% API 호환성

우수한 성능을 제공하면서 `react-native-device-info`와의 호환성을 유지합니다:

```typescript
// 마이그레이션이 간단합니다
// 이전: const deviceId = DeviceInfo.getDeviceId();
// 이후:  const deviceId = DeviceInfoModule.deviceId;
```

대부분의 API는 동일하게 유지되며, 주요 차이점은 즉시 쿼리를 위한 동기 액세스입니다.

## 각 접근 방식 선택 시점

### 브리지 기반 라이브러리 선택 시점:

- React Native < 0.68 지원
- JSI/새로운 아키텍처에 익숙하지 않은 팀
- 성능보다 생태계 안정성 우선
- 기기 정보 쿼리가 최소한인 앱 구축

### Nitro 모듈 라이브러리 선택 시점:

- 성능이 중요한 애플리케이션 구축
- React Native 새로운 아키텍처 사용 (0.68+)
- 실시간 기기 정보 필요
- 컴파일 시간 타입 안전성 필요
- 미래 지향적이고 현대적인 아키텍처 원함

## 실제 영향

### 예제: 배터리 모니터링 대시보드

매초 배터리 상태를 쿼리하는 앱:

**브리지 기반**:
- 분당 1,000회 호출
- 호출당 ~5ms = 분당 5초 오버헤드
- 비동기 처리 복잡성
- 비동기 업데이트로 인한 UI 끊김

**Nitro 모듈**:
- 분당 1,000회 호출
- 호출당 <1ms = 분당 <1초 오버헤드
- 동기적이고 즉각적인 업데이트
- 부드러운 UI 성능

## 더 알아보기

- [Nitro 모듈 공식 문서](https://nitro.margelo.com/)
- [React Native 새로운 아키텍처](https://reactnative.dev/docs/the-new-architecture/landing-page)
- [JSI 심층 분석](https://reactnative.dev/architecture/fabric-renderer#javascript-interfaces-jsi)

## 다음 단계

이제 Nitro 모듈이 이 라이브러리를 구동하는 이유를 이해했으니, 시작해 봅시다:

- [시작하기](/guide/getting-started) - 설치 가이드
- [빠른 시작](/guide/quick-start) - 코드 예제
- [API 레퍼런스](/api/) - 완전한 API 문서
