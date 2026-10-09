# Benchmark 앱

[English](README.md) | **한국어**

react-native-nitro-device-info(Nitro)와 react-native-device-info의 메서드 26개를 나란히 측정합니다. 상세 시간 통계와 속도 비율을 표시합니다.

## 기능

- **두 구현 비교**: 같은 실행에서 Nitro와 react-native-device-info 측정
- **26개 메서드**: 주요 동기·비동기 작업
- **시간 측정**: 준비 반복 후 `performance.now()` 사용. 실제 정밀도는 실행 환경에 따라 다름
- **통계**: 최솟값, 최댓값, 평균, 표준편차
- **속도 비율**: deviceInfoTime / nitroTime
- **표시 기준**: ≥2배 개선은 초록색
- **통과 목표**: 동기 메서드 <1ms, 비동기 메서드 <100ms. 라이브러리의 시간 보장이 아님
- **홍보 문구**: 결과에 따라 자동 생성
- **타입 표시**: SYNC는 보라색, ASYNC는 주황색
- **오류와 진행 상태 표시**

## 요구 사항

비교 대상 **react-native-device-info**가 필요합니다.

```bash
cd example/benchmark
yarn add react-native-device-info
cd ios && pod install  # iOS only
```

의존성이 없으면 설치 안내와 오류 카드를 표시합니다.

## 측정 방법

### 시간 측정

1. **준비**: JavaScript 엔진 최적화를 위해 100회 반복합니다(JIT 컴파일).
2. **본 측정**: 작업 비용에 따라 보통 100–1000회의 설정한 횟수로 반복합니다.
3. **시간 API**: `performance.now()`로 밀리초 이하 시간을 측정합니다.
4. **통계**: 최솟값, 최댓값, 평균, 표준편차를 계산합니다.

### 메서드 범주

- **동기 메서드**(목표 <1ms): deviceId, brand, model, systemName, systemVersion, isTablet, hasNotch, isEmulator, isCameraPresent, androidId, serialNumber(Android 전용)
- **비동기 메서드**(목표 <100ms): getUniqueId, getManufacturer, getBatteryLevel, getTotalMemory, getUsedMemory, getFreeDiskStorage, getVersion, getBuildNumber, getBundleId, getIpAddress, getMacAddress, getCarrier, getApiLevel, getSupportedAbis(Android 전용)

위 이름과 범주는 비교 대상의 호출을 가리킬 수 있습니다. Nitro 루트 API의 속성·메서드 구분은 [API 레퍼런스](../../docs/docs/ko/api/device-info.md)를 확인하세요.

### 속도 비율 계산

```
Speedup Multiplier = deviceInfoTime / nitroTime
```

- **≥2.0배**: 큰 개선(초록)
- **1.5–2.0배**: 중간 개선(파랑)
- **1.0–1.5배**: 작은 개선(주황)
- **<1.0배**: 더 느림(빨강)

## 구조

컴포넌트 계층:

```
BenchmarkScreen.tsx (main screen)
├── StatisticsPanel.tsx (aggregate metrics)
│   └── PerformanceMultiplier.tsx (speedup widgets)
└── ComparisonRow.tsx (per-method comparison)
    └── PerformanceMultiplier.tsx (speedup display)
```

핵심 측정 로직:

```
utils/timer.ts          - High-precision timing with statistics
benchmarks/comparator.ts - Side-by-side comparison logic
config/benchmarkMethods.ts - Method configurations
```

## 앱 실행

### 저장소 루트에서

```bash
yarn benchmark ios      # iOS
yarn benchmark android  # Android
```

### Benchmark 디렉터리에서

```bash
cd example/benchmark
yarn ios      # iOS
yarn android  # Android
```

## 사용법

1. 기기나 시뮬레이터에서 앱을 실행합니다.
2. react-native-device-info 설치 여부를 확인합니다.
3. "Run Performance Comparison"을 탭합니다.
4. 26개 메서드 × 2개 라이브러리의 측정 완료를 기다립니다.
5. 통계 패널의 전체 지표·홍보 문구와 메서드별 시간을 확인합니다. 초록 행은 ≥2배 개선, 파랑 배지는 목표 시간 통과입니다.
6. 하단의 플랫폼과 타임스탬프를 확인합니다.

## 결과 해석

### 통계 패널

- **Total/Successful**: 측정한 메서드 수와 성공 수
- **Avg/Max Speedup**: 평균·최대 속도 비율
- **Significant Count**: ≥2배 개선한 메서드 수
- **Pass Rates**: 목표 시간을 충족한 비율

### 비교 행

각 행은 다음을 표시합니다.

- **Method Name**: 측정한 속성 또는 함수
- **Type Badge**: SYNC(보라) / ASYNC(주황)
- **Status Badge**: PASS(파랑) / FAIL(빨강) / ERROR(회색)
- **Nitro Time**: Nitro 평균 시간
- **DeviceInfo Time**: react-native-device-info 평균 시간
- **Speedup**: 속도 비율과 개선 표시

## 개발

- **성능 검증**: JSI 접근 비용 측정
- **회귀 검사**: 업데이트 후 성능 저하 확인
- **비교 지표**: 조건을 기록한 성능 수치 생성
- **플랫폼 비교**: iOS와 Android 성능 특성 측정

## 문제 해결

### 의존성 오류

"react-native-device-info is not properly installed"가 표시되면 다음을 실행하세요.

1. `cd example/benchmark && yarn add react-native-device-info`로 설치합니다.
2. iOS에서는 `cd ios && pod install`로 연결합니다.
3. 정리 후 `yarn benchmark ios --reset-cache` 또는 `yarn benchmark android`로 다시 빌드합니다.

### 결과가 일정하지 않은 경우

- 정확한 시간 측정에는 실제 기기를 사용하세요. 시뮬레이터는 JIT 영향이 나타날 수 있습니다.
- 백그라운드 앱을 닫아 시스템 부하를 줄이세요.
- 여러 번 측정하고 평균을 비교하세요.
- 준비 단계에서 JIT 컴파일을 안정화하세요.
- 기기, OS, 라이브러리 버전, 빌드 모드, 캐시 상태를 함께 기록하세요.
